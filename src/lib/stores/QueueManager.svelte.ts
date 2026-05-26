import type { QueueItemData, RawQueueItemData } from "$lib/types";
import { extractYoutubeVideoData, formatYoutubeDuration } from "$lib/utils";
import Dexie, { liveQuery, type EntityTable } from "dexie";
import { generateKeyBetween } from "fractional-indexing";
import { PersistedState } from "runed";
import { toast } from "svelte-sonner";
import RandomColorStore from "./RandomColorStore";
import type { VideoData } from "$lib/api/types";
import type YoutubeApi from "$lib/api/YoutubeApiClient";
import { dev } from "$app/environment";
import type SettingsStore from "./SettingsStore.svelte";

type QueueItemParams = {
	videoData: VideoData;
	videoId: string;
	startSeconds: number;
	username: string;
	message: string;
	value: number;
}

class QueueManager extends Dexie {
	private _settings: SettingsStore;
	private _randomColor = new RandomColorStore();
	private _index = new PersistedState('queueItemIndex', 0);
	private _items = $state<QueueItemData[]>([]);
	private _isLoading = $state(true);

	readonly current = $derived(this._items[this.index] ?? null);
	readonly upcoming = $derived(this._items.slice(this.index + 1));

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

	public async enqueue(items: QueueItemData[]) {
		if (this.isFull || items.length === 0) return;

		const itemsSnapshot = $state.snapshot(items);
		const toastTitle = items.length === 1 ? 'Видео добавлено' : `Видео добавлено +${items.length}`;

		try {
			await this.queueItems.bulkAdd(itemsSnapshot);
			toast.success(toastTitle, {
				description: items[0].title
			});
		} catch (err) {
			toast.error(`Не удалось добавить видео +${items.length}`, { description: (err as Error).message });
		}
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

	public async addVideo(username: string, message: string, value: number) {
		const data = extractYoutubeVideoData(message);
		if (!data) {
			console.warn(`No video data found in message: "${message}"`);
			return;
		}

		// if (value === 0 && this._pendingVideoIds.has(data.videoId)) return;

		// const existingItem = await this.queueItems.where({ videoId: data.videoId }).first();
		// if (existingItem && value === 0) return;

		if (value === 0) {
			this._pendingVideoIds.add(data.videoId);
		}

		const videoData = await this._youtubeApi.getVideo(data.videoId);

		if (videoData) {
			const newItem = this._composeQueueItem({
				videoData,
				username,
				message,
				value,
				...data
			});

			this._pendingSaveBuffer.push(newItem);

			if (!this._isProcessingBuffer) {
				this._processSaveBuffer();
			}

			this._pendingVideoIds.delete(data.videoId);
		}
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
				// 1. Find where this item belongs BEFORE calculating the key
				const targetIndex = this._getTargetInsertionIndex(item);

				// 2. Pass that target index to generate a true, unique neighbor key
				const newSortOrder = this._calculateSortOrder(item, targetIndex);

				const newItem: QueueItemData = {
					...item,
					id: crypto.randomUUID(),
					sortOrder: newSortOrder
				};

				// 3. CRITICAL: Insert the item exactly at its sorted position mid-loop
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

		// Default target for empty array or normal items is the end of the list
		if (totalItems === 0 || !item.value || item.value <= 0) {
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

		// Case 1: Database is completely empty
		if (totalItems === 0) {
			return generateKeyBetween(null, null);
		}

		// Case 2: High-value requests injected near the current index
		if (item.value && item.value > 0) {
			const afterKey = this._items[targetIndex - 1]?.sortOrder || null;
			const beforeKey = this._items[targetIndex]?.sortOrder || null;

			// Safeguard: If fractional keys ever collapse due to massive batches, append cleanly
			if (afterKey && beforeKey && afterKey >= beforeKey) {
				return generateKeyBetween(afterKey, null);
			}
			return generateKeyBetween(afterKey, beforeKey);
		}

		// Case 3: Normal items appended to the absolute tail
		const absoluteTailKey = this._items[totalItems - 1]?.sortOrder || null;
		return generateKeyBetween(absoluteTailKey, null);
	}

	private async _commitBatch(itemsToSave: QueueItemData[]) {
		try {
			await this.enqueue(itemsToSave);
		} catch (err) {
			console.error("Failed to commit batch to queue storage:", err);
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

	private _composeQueueItem(params: QueueItemParams): Omit<QueueItemData, 'id' | 'sortOrder'> {
		const color = this._randomColor.get().array() as [number, number, number];
		const isLive = params.videoData.snippet.liveBroadcastContent === 'live';
		const duration = params.videoData.contentDetails.duration;

		return {
			channelTitle: params.videoData.snippet.channelTitle,
			title: params.videoData.snippet.title,
			thumbnail: params.videoData.snippet.thumbnails.medium.url,
			duration: duration && formatYoutubeDuration(duration),
			videoId: params.videoId,
			viewCount: params.videoData.statistics.viewCount,
			publishedAt: params.videoData.snippet.publishedAt,
			isLive,
			startSeconds: params.startSeconds,
			value: params.value,
			submittedBy: params.username,
			color,
		}
	}
}

export default QueueManager;
