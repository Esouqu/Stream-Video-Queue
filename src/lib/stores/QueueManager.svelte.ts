import type { QueueItemData, RawQueueItemData } from "$lib/types";
import Dexie, { liveQuery, type EntityTable } from "dexie";
import { generateKeyBetween } from "fractional-indexing";
import { PersistedState } from "runed";
import { toast } from "svelte-sonner";
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

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	private _pendingVideoIds = new Set<string>();
	private _pendingSaveBuffer: RawQueueItemData[] = [];
	private _isProcessingBuffer = false;
	private _tickerInterval: number | null = null;
	private _clusterTailId = new PersistedState<string | null>('clusterTailId', null);

	get items() { return this._items; }
	get index() { return this._index.current; }
	set index(val: number) { this._index.current = val; }
	get size() { return this._items.length; }
	get isFull() { return this._settings.queueLimit && this.size >= this._settings.queueLimit; }
	get isEmpty() { return this._items.length === 0; }
	get isFirstItem() { return this.index === 0; }
	get isLastItem() { return this.index === this.size - 1; }
	get isLoading() { return this._isLoading; }

	constructor(settings: SettingsStore) {
		super('StreamQueueDB');

		this._settings = settings;

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
			toast.error('Не удалось очистить очередь', {
				description: (err as Error).message
			});
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
		if (this._clusterTailId.current === item.id) {
			this._clusterTailId.current = null;
		}

		try {
			await this.queueItems.delete(item.id);

			toast.success("Видео удалено из очереди", {
				description: item.title,
			});
		} catch (err) {
			toast.error('Не удалось удалить видео', { description: (err as Error).message });
		}
	}

	public async enqueue(data: RawQueueItemData) {
		this._pendingVideoIds.add(data.videoId);
		this._pendingSaveBuffer.push(data);

		if (!this._tickerInterval) {
			this._startHeartbeat();
		}
	}

	public isDuplicate(videoId: string) {
		return this._items.find((i) => i.videoId === videoId);
	}

	private _stopHeartbeat() {
		if (this._tickerInterval) {
			clearInterval(this._tickerInterval);
			this._tickerInterval = null;
		}
	}

	private _startHeartbeat() {
		this._tickerInterval = window.setInterval(async () => {
			if (this._isProcessingBuffer) return;

			if (this._pendingSaveBuffer.length === 0) {
				this._stopHeartbeat();
				return;
			}

			this._isProcessingBuffer = true;
			try {
				await this._flushBuffer();
			} catch (err) {
				console.error("Failed to flush buffer:", err);
			} finally {
				this._isProcessingBuffer = false;
			}
		}, 100);
	}

	private async _flushBuffer() {
		this._isProcessingBuffer = true;

		try {
			while (this._pendingSaveBuffer.length > 0) {
				const currentBatch = [...this._pendingSaveBuffer];
				this._pendingSaveBuffer = [];

				console.log(`Saving ${currentBatch.length} items...`);
				const itemsToSave: QueueItemData[] = [];
				const localItemsCopy = [...this._items];

				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				const idMap = new Map<string, number>();
				for (let i = 0; i < localItemsCopy.length; i++) {
					idMap.set(localItemsCopy[i].id, i);
				}

				for (const item of currentBatch) {
					const targetIndex = this._getTargetInsertionIndexFromTracker(item, localItemsCopy, idMap);
					const newSortOrder = this._calculateSortOrderFromList(item, targetIndex, localItemsCopy);

					const newItem: QueueItemData = {
						...item,
						id: crypto.randomUUID(),
						sortOrder: newSortOrder
					};

					if (item.value && item.value > 0 && localItemsCopy.length > 0) {
						// Insert into the cluster
						localItemsCopy.splice(targetIndex, 0, newItem);

						// Shift ID lookup map for elements affected by splice
						for (let i = targetIndex; i < localItemsCopy.length; i++) {
							idMap.set(localItemsCopy[i].id, i);
						}

						// This newly inserted high-value item is now the tail of the cluster
						this._clusterTailId.current = newItem.id;
					} else {
						// Normal items append to the absolute end
						localItemsCopy.push(newItem);
						idMap.set(newItem.id, localItemsCopy.length - 1);
					}

					itemsToSave.push(newItem);
				}

				this._items = localItemsCopy;

				if (dev) {
					this._analyzeDuplicates();
				}

				try {
					await this._commitBatch(itemsToSave);
				} finally {
					for (const item of currentBatch) {
						this._pendingVideoIds.delete(item.videoId);
					}
				}
			}
		} finally {
			this._isProcessingBuffer = false;
		}
	}

	private _getTargetInsertionIndexFromTracker(
		item: RawQueueItemData,
		list: QueueItemData[],
		idMap: Map<string, number>
	): number {
		const totalItems = list.length;

		if (totalItems === 0 || item.value <= 0) {
			return totalItems;
		}

		const fallbackIndex = Math.min(totalItems, Math.max(0, this.index + 1));

		if (this._clusterTailId.current) {
			const trackedIdx = idMap.get(this._clusterTailId.current);

			if (trackedIdx !== undefined && trackedIdx < totalItems && trackedIdx >= fallbackIndex) {
				return trackedIdx + 1;
			}
		}

		return fallbackIndex;
	}

	private _calculateSortOrderFromList(item: RawQueueItemData, targetIndex: number, list: QueueItemData[]): string {
		const totalItems = list.length;

		if (totalItems === 0) {
			return generateKeyBetween(null, null);
		}

		if (item.value > 0) {
			const afterKey = list[targetIndex - 1]?.sortOrder || null;
			const beforeKey = list[targetIndex]?.sortOrder || null;

			if (afterKey && beforeKey && afterKey >= beforeKey) {
				return generateKeyBetween(afterKey, null);
			}

			return generateKeyBetween(afterKey, beforeKey);
		}

		const absoluteTailKey = list[totalItems - 1]?.sortOrder || null;
		return generateKeyBetween(absoluteTailKey, null);
	}

	private async _commitBatch(itemsToSave: QueueItemData[]) {
		if (this.isFull || itemsToSave.length === 0) return;

		const itemsSnapshot = $state.snapshot(itemsToSave);
		const isOneVideo = itemsToSave.length === 1;
		const toastTitle = isOneVideo ? 'Видео добавлено' : `Добавлено несколько видео`;
		const toastDescription = isOneVideo ? itemsToSave[0].title : `${itemsToSave[0].title} +${itemsToSave.length}`;

		try {
			await this.queueItems.bulkAdd(itemsSnapshot);
			toast.success(toastTitle, {
				description: toastDescription
			});
		} catch (err) {
			console.error("Failed to commit batch to queue storage:", err);
			toast.error(`Не удалось добавить видео +${itemsToSave.length}`, {
				description: (err as Error).message
			});
		}
	}

	private _getPaidMs(): number {
		const pricePerMin = this._settings?.paidTimePricePerMinute;

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
