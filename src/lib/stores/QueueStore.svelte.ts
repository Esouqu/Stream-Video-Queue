import type { DBSchema } from "$lib/dexie";
import type { QueueItemData } from "$lib/types";
import EventEmitter from "$lib/utils/EventEmitter";
import { liveQuery } from "dexie";
import { PersistedState } from "runed";

type RawQueueItem = Omit<QueueItemData, 'id' | 'sortOrder'>;
type QueueStorePersisted = {
	index: number;
	shouldInsertRandomly: boolean;
	limit: number | null;
}
type QueueStoreEvents = {
	itemsChanged: {
		newItem?: QueueItemData;
	};
}

class QueueStore extends EventEmitter<QueueStoreEvents> {
	private _items = $state<QueueItemData[]>([]);
	private _persisted = new PersistedState<QueueStorePersisted>('queueStore', {
		index: 0,
		shouldInsertRandomly: false,
		limit: null,
	});
	private _midDistance = 0.00001;
	private _db: DBSchema;

	// readonly currentIndex = $derived(this._items.findIndex((item) => item.isActive));
	// readonly current? = $derived(this._items.find((item) => item.isActive));
	// readonly upcoming = $derived(this._items.slice(this.currentIndex + 1));
	readonly current? = $derived(this._items[this.index]);
	readonly upcoming = $derived(this._items.slice(this.index + 1));

	constructor(db: DBSchema) {
		super();
		this._db = db;
	}

	get index() {
		return this._persisted.current.index;
	}
	set index(val: number) {
		this._persisted.current.index = val;
	}

	get size() {
		return this._items.length;
	}

	get shouldInsertRandomly() {
		return this._persisted.current.shouldInsertRandomly;
	}

	set shouldInsertRandomly(value: boolean) {
		this._persisted.current.shouldInsertRandomly = value;
	}

	get limit() {
		return this._persisted.current.limit;
	}

	set limit(val: number | null) {
		this._persisted.current.limit = val;
	}

	get isFull() {
		return this.limit && this.size >= this.limit;
	}

	get isEmpty() {
		return this._items.length === 0;
	}

	public async initialize() {
		liveQuery(async () => await this._db.queueItems.orderBy('sortOrder').toArray())
			.subscribe(this._updateItems.bind(this));
	}

	public async previous() {
		if (this.size <= 1 || !this.current) return;

		this.index = (this.index - 1 + this.size) % this.size;
		this.emit('itemsChanged', { newItem: this.current });

		// let nextItem = await this._db.queueItems
		// 	.where('sortOrder').below(this.current.sortOrder)
		// 	.reverse()
		// 	.first();

		// if (!nextItem) {
		// 	nextItem = await this._db.queueItems.orderBy('sortOrder').last();
		// }

		// if (nextItem) await this._updateActive(nextItem);
	}

	public async next() {
		if (this.size <= 1 || !this.current) return;

		this.index = (this.index + 1) % this.size;
		this.emit('itemsChanged', { newItem: this.current });

		// let nextItem = await this._db.queueItems
		// 	.where('sortOrder').above(this.current.sortOrder)
		// 	.first();

		// if (!nextItem) {
		// 	nextItem = await this._db.queueItems.orderBy('sortOrder').first();
		// }

		// if (nextItem) await this._updateActive(nextItem);
	}

	public async select(item: QueueItemData) {
		const itemIdx = this._items.findIndex((i) => i.id === item.id);

		if (itemIdx > -1) {
			this.index = itemIdx;
			this.emit('itemsChanged', { newItem: this.current });
		}
	}

	public async dequeue(item: QueueItemData) {
		await this._db.queueItems.delete(item.id);
	}

	public async enqueue(item: RawQueueItem) {
		if (this.current && item.value > 0) {
			await this._insertItemWithConditionalSkip(item, this.current.id);
		} else {
			await this._createAndInsertItem(item, !this.shouldInsertRandomly, this.current?.id);
		}
	}

	public async clear() {
		this.index = 0;
		await this._db.queueItems.clear();
	}

	public async getItemByVideoId(videoId: string) {
		return await this._db.queueItems.where({ videoId }).first();
	}

	private async _insertItemWithConditionalSkip(newItemData: RawQueueItem, anchorId: number) {
		let needDefrag = false;

		const savedId = await this._db.transaction('rw', this._db.queueItems, async () => {
			const anchorItem = await this._getAnchorOrThrow(anchorId);
			const subsequentItems = await this._getSubsequentItems(anchorItem.sortOrder);

			let targetPrevOrder = anchorItem.sortOrder;
			let targetNextOrder: number | null = null;

			// Scan past consecutive items with positive values
			for (const item of subsequentItems) {
				if (item.value > 0) {
					targetPrevOrder = item.sortOrder;
				} else {
					targetNextOrder = item.sortOrder;
					break;
				}
			}

			const finalOrder = this._calculateTargetOrder(targetPrevOrder, targetNextOrder);

			// Flag for background defragmentation outside the transaction boundary
			if (targetNextOrder !== null && (targetNextOrder - targetPrevOrder) < this._midDistance) {
				needDefrag = true;
			}

			return await this._db.queueItems.add({ ...newItemData, sortOrder: finalOrder });
		});

		if (needDefrag) {
			this._scheduleDefragmentation();
		}

		return savedId;
	}

	private async _createAndInsertItem(newItemData: RawQueueItem, atEnd = true, anchorId?: number) {
		return await this._db.transaction('rw', this._db.queueItems, async () => {
			const [firstItem, lastItem] = await Promise.all([
				this._db.queueItems.orderBy('sortOrder').first(),
				this._db.queueItems.orderBy('sortOrder').last()
			]);

			// Fallback if the table is entirely empty
			if (!firstItem || !lastItem) {
				return await this._db.queueItems.add({ ...newItemData, sortOrder: 10, isActive: true });
			}

			if (atEnd) {
				const finalOrder = lastItem.sortOrder + 10;
				return await this._db.queueItems.add({ ...newItemData, sortOrder: finalOrder });
			}

			const anchorItem = anchorId ? await this._getAnchorOrThrow(anchorId) : firstItem;
			const subsequentItems = await this._getSubsequentItems(anchorItem.sortOrder);

			// Find the valid starting boundary by skipping all consecutive positive items
			const validPool = this._filterPoolAfterPositiveItems(anchorItem, subsequentItems);

			// If no items remain after the skip, treat it as the end of the list
			if (validPool.length <= 1) {
				const boundaryItem = validPool[0] || anchorItem;
				const finalOrder = boundaryItem.sortOrder + 10;
				return await this._db.queueItems.add({ ...newItemData, sortOrder: finalOrder });
			}

			// Select a random gap inside the valid, skipped sequential pool
			const randomIndex = Math.floor(Math.random() * (validPool.length - 1));
			const finalOrder = this._calculateMidpoint(validPool[randomIndex].sortOrder, validPool[randomIndex + 1].sortOrder);

			return await this._db.queueItems.add({ ...newItemData, sortOrder: finalOrder });
		});
	}

	private async _defragmentSortOrders() {
		try {
			// Open a Read/Write transaction on the items table
			await this._db.transaction('rw', this._db.queueItems, async () => {

				// Fetch all items in the exact order they currently display
				const items = await this._db.queueItems.orderBy('sortOrder').toArray();

				if (items.length === 0) return;

				// Prepare background update promises
				// Each item gets a new clean index multiplied by 10 (10, 20, 30, 40...)
				const updatePromises = items.map((item, index) => {
					const cleanOrder = (index + 1) * 10;

					// Only trigger an actual database write if the number has actually changed
					if (item.sortOrder !== cleanOrder) {
						return this._db.queueItems.update(item.id, { sortOrder: cleanOrder });
					}
					return null;
				}).filter(Boolean); // Filter out rows that were already cleanly aligned

				// Execute all database updates in parallel inside the transaction
				await Promise.all(updatePromises);
				console.log(`Database defragmentation successful. Reset ${updatePromises.length} item positions.`);
			});
		} catch (error) {
			console.error('Critical: Defragmentation transaction failed. Changes rolled back.', error);
		}
	}

	private _filterPoolAfterPositiveItems(anchorItem: QueueItemData, subsequentItems: QueueItemData[]) {
		let scanIndex = 0;

		// Advance past all elements with positive values
		while (scanIndex < subsequentItems.length && subsequentItems[scanIndex].value > 0) {
			scanIndex++;
		}

		// The new baseline anchor is either the last positive item skipped or the original anchor
		const baselineAnchor = scanIndex > 0 ? subsequentItems[scanIndex - 1] : anchorItem;

		// Return the baseline anchor coupled with all remaining non-positive items
		return [baselineAnchor, ...subsequentItems.slice(scanIndex)];
	}

	private async _getAnchorOrThrow(anchorId: number) {
		const anchorItem = await this._db.queueItems.get(anchorId);
		if (!anchorItem) {
			throw new Error(`Anchor item with ID ${anchorId} not found.`);
		}
		return anchorItem;
	}

	private async _getSubsequentItems(sortOrder: number) {
		return await this._db.queueItems
			.where('sortOrder')
			.above(sortOrder)
			.sortBy('sortOrder');
	}

	private _calculateTargetOrder(prev: number, next: number | null) {
		return next !== null
			? this._calculateMidpoint(prev, next)
			: parseFloat((prev + 10).toFixed(10));
	}

	private _calculateMidpoint(a: number, b: number) {
		return parseFloat(((a + b) / 2).toFixed(10));
	}

	private _scheduleDefragmentation() {
		console.warn("Sort orders narrow. Scheduling background defragmentation...");
		setTimeout(() => {
			this._defragmentSortOrders().catch(err => console.error("Defrag failed:", err));
		}, 100);
	}

	private _updateItems(items: QueueItemData[]) {
		this._items = items;

		// // Map new items by ID for fast lookup
		// // eslint-disable-next-line svelte/prefer-svelte-reactivity
		// const newItemMap = new Map(items.map((item) => [item.id, item]));
		// const currentItems = this._items;

		// // Remove items no longer present
		// for (let i = currentItems.length - 1; i >= 0; i--) {
		// 	if (!newItemMap.has(currentItems[i].id)) {
		// 		currentItems.splice(i, 1);
		// 	}
		// }

		// // Update existing items or add new ones
		// items.forEach((newItem, index) => {
		// 	const currentIndex = currentItems.findIndex((item) => item.id === newItem.id);

		// 	if (currentIndex !== -1) {
		// 		// Check if properties actually changed to avoid over-triggering
		// 		// if (JSON.stringify(currentItems[currentIndex]) !== JSON.stringify(newItem)) {
		// 		// 	currentItems[currentIndex] = newItem;
		// 		// }
		// 		Object.assign(currentItems[currentIndex], newItem)
		// 	} else {
		// 		// Insert new item at its correct sorted position
		// 		currentItems.splice(index, 0, newItem);
		// 	}
		// });
	}
}

export default QueueStore;
