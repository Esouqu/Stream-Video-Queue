import { randInt } from "$lib/utils";
import { PersistedState } from "runed";

type RequiredFields = {
	id: string | number;
};

type PersistedFields = {
	index: number;
	shuffledIndices: number[];
	isRandomOrder: boolean;
	shouldDequeue: boolean;
};

class QueueStore<T extends RequiredFields> {
	private _items: T[];
	private _persisted: PersistedState<PersistedFields>;

	readonly displayedItems: T[];
	readonly current: T | undefined;
	readonly upcoming: T[];

	constructor(id: string, items: T[] = []) {
		this._items = $state(items);

		this._persisted = new PersistedState(id, {
			index: 0,
			shuffledIndices: [],
			isRandomOrder: false,
			shouldDequeue: false
		});

		this.displayedItems = $derived(
			this.isRandomOrder && this._items.length > 0
				? this.shuffledIndices.map((i) => this._items[i])
				: this._items
		);
		this.current = $derived(this.displayedItems[this.index]);
		this.upcoming = $derived(this.displayedItems.slice(this.index + 1));
	}

	get size() {
		return this._items.length;
	}

	get index() {
		return this._persisted.current.index;
	}

	set index(value: number) {
		this._persisted.current.index = value;
	}

	get isEmpty() {
		return this._items.length === 0;
	}

	get isRandomOrder() {
		return this._persisted.current.isRandomOrder;
	}

	set isRandomOrder(value: boolean) {
		if (value) {
			this.shuffledIndices = this.createShuffledIndices();
		} else if (this.current) {
			this.index = this._getOrderedIndex(this.current);
			this.shuffledIndices = [];
		}

		this._persisted.current.isRandomOrder = value;
	}

	get shouldDequeue() {
		return this._persisted.current.shouldDequeue;
	}

	set shouldDequeue(value: boolean) {
		this._persisted.current.shouldDequeue = value;
	}

	private get shuffledIndices() {
		return this._persisted.current.shuffledIndices;
	}

	private set shuffledIndices(value: number[]) {
		this._persisted.current.shuffledIndices = value;
	}

	public setItems(items: T[]) {
		this._items = items;

		if (this._items.length !== this.shuffledIndices.length && this.isRandomOrder) {
			console.warn(
				`Mismatch between items (length ${this._items.length}) and shuffled indices (length ${this.shuffledIndices.length})`)
		}
	}

	public clear() {
		this._items = [];
		this.shuffledIndices = [];
		this.index = 0;
		this.isRandomOrder = false;
	}

	public previous() {
		this.index = (this.index - 1 + this.size) % this.size;
	}

	public next() {
		if (this.shouldDequeue) {
			this.dequeue(this.current!);
			return;
		}

		this.index = (this.index + 1) % this.size;
	}

	public select(item: T) {
		const idx = this._getDisplayedIndex(item);
		if (idx === -1)
			throw new Error(`Item with id ${item.id} not found`);

		this.index = idx;
	}

	public dequeue(item: T) {
		const itemIndex = this._getOrderedIndex(item);
		this._items.splice(itemIndex, 1);

		if (this.isRandomOrder) {
			this.shuffledIndices = this.shuffledIndices
				.filter((i) => i !== itemIndex)
				.map((i) => (i > itemIndex ? i - 1 : i));
		}

		if (this.size === 0 || this.index >= this.size) {
			this.index = 0;
		}
	}

	public enqueue(item: T) {
		if (this.isRandomOrder) {
			const insertAt = randInt(this.index + 1, this.size);
			this.shuffledIndices.splice(insertAt, 0, this.size);
		}

		this._items.push(item);
	}

	private _getDisplayedIndex(item: T) {
		return this.displayedItems.findIndex((i) => i.id === item.id);
	}

	private _getOrderedIndex(item: T) {
		return this._items.findIndex((i) => i.id === item.id);
	}

	private createShuffledIndices(): number[] {
		const indices = Array.from({ length: this.size }, (_, i) => i);
		const current = this.index;

		// Remove current, shuffle the rest, then reinsert at the same position
		indices.splice(current, 1);

		for (let i = indices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[indices[i], indices[j]] = [indices[j], indices[i]];
		}

		indices.splice(current, 0, current);

		return indices;
	}
}

export default QueueStore;
