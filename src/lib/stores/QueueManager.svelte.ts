import type { QueueItemData, RawQueueItemData } from "$lib/types";
import Dexie, { liveQuery, type EntityTable } from "dexie";
import { generateKeyBetween } from "fractional-indexing";
import { PersistedState } from "runed";
import { toast } from "svelte-sonner";
import type YoutubeApi from "$lib/api/YoutubeApiClient";
import { dev } from "$app/environment";
import type SettingsStore from "./SettingsStore.svelte";

class QueueManager extends Dexie {
	private _settings: SettingsStore;
	private _index = new PersistedState('queueItemIndex', 0);
	private _items = $state<QueueItemData[]>([]);
	private _isLoading = $state(true);

	readonly current = $derived(this._items[this.index] ?? null);
	readonly upcoming = $derived(this._items.slice(this.index + 1));
	readonly currentPaidMs = $derived.by(this._getPaidMs.bind(this));

	queueItems!: EntityTable<QueueItemData, 'id'>;
	private _youtubeApi: YoutubeApi;

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	private _pendingVideoIds = new Set<string>();
	private _pendingSaveBuffer: RawQueueItemData[] = [];
	private _isProcessingBuffer = false;

	get items() { return this._items; }
	get index() { return this._index.current; }
	set index(val: number) { this._index.current = val; }
	get size() { return this._items.length; }
	get isFull() { return this._settings.queueLimit && this.size >= this._settings.queueLimit; }
	get isEmpty() { return this._items.length === 0; }
	get isFirstItem() { return this.index === 0; }
	get isLastItem() { return this.index === this.size - 1; }
	get isLoading() { return this._isLoading; }

	constructor(youtubeApi: YoutubeApi, settings: SettingsStore) {
		super('StreamQueueDB');

		this._settings = settings;
		this._youtubeApi = youtubeApi;

		liveQuery(async () => await this.queueItems.orderBy('sortOrder').toArray())
			.subscribe(this._updateItems.bind(this));

		this.version(1).stores({
			queueItems: 'id, videoId, sortOrder',
		});
	}

	public async clear() {
		this.index = 0;

		try {
			await this.queueItems.clear();
			toast.success("Очередь очищена");
		} catch (err) {
			toast.error('Не удалось очистить очередь', { description: (err as Error).message });
		}
	}

	public previous() {
		if (this.size <= 1 || !this.current) return;

		this.index = (this.index - 1 + this.size) % this.size;
	}

	public next() {
		if (this.size <= 1 || !this.current) return;

		this.index = (this.index + 1) % this.size;
	}

	public select(item: QueueItemData) {
		const itemIdx = this._items.findIndex((i) => i.id === item.id);

		if (itemIdx > -1) {
			this.index = itemIdx;
		}
	}

	public async dequeue(item: QueueItemData) {
		try {
			await this.queueItems.delete(item.id);
			toast.success("Видео удалено из очереди", {
				description: item.title,
			});
		} catch (err) {
			toast.error('Не удалось удалить видео', { description: (err as Error).message });
		}
	}

	public async isExisting(videoId: string) {
		return await this.queueItems.where({ videoId }).first();
	}

	public async enqueue(data: RawQueueItemData) {
		const isFree = data.value === 0;

		console.log(Array.from(this._pendingVideoIds.values()))
		if (isFree && this._pendingVideoIds.has(data.videoId)) return;

		this._pendingVideoIds.add(data.videoId);
		this._pendingSaveBuffer.push(data);

		if (!this._isProcessingBuffer) {
			await this._processSaveBuffer();
		}

		this._pendingVideoIds.delete(data.videoId);
	}

	private _getPaidMs(): number {
		const pricePerMin = this._settings?.paidTimerPricePerMinute;

		if (!this.current || this.current.value <= 0 || !pricePerMin || pricePerMin <= 0) {
			return 0;
		}

		const paidMinutes = this.current.value / pricePerMin;
		let endDuration = Math.round(paidMinutes * 60 * 1000);

		if (this.current.durationMs) {
			endDuration = Math.min(this.current.durationMs, endDuration);
		}

		return endDuration;
	}

	private _updateItems(items: QueueItemData[]) {
		if (this._items.length === 0) {
			this._items = items;
			this._isLoading = false;
			return;
		}

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const existingMap = new Map(this._items.map(item => [item.id, item]));

		this._items = items.map(newItem => {
			const existing = existingMap.get(newItem.id);

			if (existing) {
				Object.assign(existing, newItem);
				return existing;
			}

			return newItem;
		});
	}

	private async _processSaveBuffer() {
		this._isProcessingBuffer = true;

		while (this._pendingSaveBuffer.length > 0) {
			const currentBatch = [...this._pendingSaveBuffer];
			this._pendingSaveBuffer = [];

			console.log(`Saving ${currentBatch.length} items...`);
			const itemsToSave: QueueItemData[] = [];

			for (const item of currentBatch) {
				const targetIndex = this._getTargetInsertionIndex(item);
				const newSortOrder = this._calculateSortOrder(item, targetIndex);

				const newItem: QueueItemData = {
					...item,
					id: crypto.randomUUID(),
					sortOrder: newSortOrder
				};

				if (item.value && item.value > 0 && this._items.length > 0) {
					this._items.splice(targetIndex, 0, newItem);
				} else {
					this._items.push(newItem);
				}

				itemsToSave.push(newItem);
			}

			if (dev) {
				this._analyzeDuplicates();
			}

			await this._commitBatch(itemsToSave);
		}

		this._isProcessingBuffer = false;
	}

	private _getTargetInsertionIndex(item: RawQueueItemData): number {
		const totalItems = this._items.length;

		if (totalItems === 0 || item.value <= 0) {
			return totalItems;
		}

		// Scan forward to find the true end of the high-value cluster
		let insertIdx = Math.max(0, this.index);
		while (
			insertIdx < totalItems &&
			this._items[insertIdx]?.value &&
			this._items[insertIdx].value > 0
		) {
			insertIdx++;
		}
		return insertIdx;
	}

	private _calculateSortOrder(item: RawQueueItemData, targetIndex: number): string {
		const totalItems = this._items.length;

		// Database is completely empty
		if (totalItems === 0) {
			return generateKeyBetween(null, null);
		}

		// High-value requests injected near the current index
		if (item.value > 0) {
			const afterKey = this._items[targetIndex - 1]?.sortOrder || null;
			const beforeKey = this._items[targetIndex]?.sortOrder || null;

			// If fractional keys ever collapse due to massive batches, append cleanly
			if (afterKey && beforeKey && afterKey >= beforeKey) {
				return generateKeyBetween(afterKey, null);
			}

			return generateKeyBetween(afterKey, beforeKey);
		}

		// Normal items appended to the absolute tail
		const absoluteTailKey = this._items[totalItems - 1]?.sortOrder || null;
		return generateKeyBetween(absoluteTailKey, null);
	}

	private async _commitBatch(itemsToSave: QueueItemData[]) {
		if (this.isFull || itemsToSave.length === 0) return;

		const itemsSnapshot = $state.snapshot(itemsToSave);
		const toastTitle = itemsToSave.length === 1 ? 'Видео добавлено' : `Видео добавлено +${itemsToSave.length}`;

		try {
			await this.queueItems.bulkAdd(itemsSnapshot);
			toast.success(toastTitle, {
				description: itemsToSave[0].title
			});
		} catch (err) {
			console.error("Failed to commit batch to queue storage:", err);
			toast.error(`Не удалось добавить видео +${itemsToSave.length}`, { description: (err as Error).message });
		}
	}


	private _analyzeDuplicates() {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const keyMap = new Map<string, number[]>();

		this._items.forEach((item, index) => {
			if (!keyMap.has(item.sortOrder)) {
				keyMap.set(item.sortOrder, []);
			}
			keyMap.get(item.sortOrder)!.push(index);
		});

		let duplicateCount = 0;

		keyMap.forEach((indices, key) => {
			if (indices.length > 1) {
				duplicateCount++;
				console.error(
					`🚨 [DUPLICATE DETECTED POST-BATCH] Key "${key}" is shared by ${indices.length} items!\n` +
					`- Array Indices: [${indices.join(', ')}]\n` +
					`- Associated item values:`, indices.map(idx => this._items[idx]?.value)
				);
			}
		});

		if (duplicateCount === 0) {
			console.log(`✅ [POST-BATCH CHECK] Clean! No duplicate sort keys found across all ${this._items.length} items.`);
		} else {
			console.warn(`⚠️ [POST-BATCH CHECK] Found ${duplicateCount} unique duplicate key clusters.`);
		}
	}
}

export default QueueManager;
