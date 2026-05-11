import type { QueueItemData } from "$lib/types";

export class MultiQueueStore<T extends { id: string | number, value: number }> {
	private _values: number[];
	private _itemIndex: number;
	private _arrayIndex: number;
	private _items: T[];
	private _splittedItems: T[][];
	readonly current?: T;

	public isNextRandom = $state(false);

	constructor(values: number[] = [400, 200, 300, 100], items: T[] = [], arrayIndex = 0, itemIndex = 0) {
		this._values = $state(values);
		this._itemIndex = $state(itemIndex);
		this._arrayIndex = $state(arrayIndex);
		this._items = $state(items);
		this._splittedItems = $derived.by(this._splitByValue.bind(this));
		this.current = $derived(this._splittedItems[this._arrayIndex][this._itemIndex]);

		setTimeout(() => {
			// @ts-expect-error qwe
			this._items = this._getRandomItems();
			if (!this.current) this.next();
		}, 1000)
	}

	public clear() {
		this._items = [];
		this._itemIndex = 0;
		this._arrayIndex = 0;
	}

	public random() {
		const currentIndex = this._itemIndex;
		const items = this._splittedItems[this._arrayIndex];

		if (items.length === 1) {
			this._itemIndex = 0;
			return;
		}

		do {
			this._itemIndex = Math.floor(Math.random() * items.length);
		} while (this._itemIndex === currentIndex);
	}

	public previous() {
		const prevIndex = this._itemIndex - 1;

		if (prevIndex >= 0) {
			this._itemIndex = prevIndex;
		} else {
			this._arrayIndex = this._findNextArrayIndex(-1);
			this._itemIndex = this._splittedItems[this._arrayIndex].length - 1;
		}
	}

	public next() {
		if (this.isNextRandom) {
			this.random();
			return;
		}

		const nextIndex = this._itemIndex + 1;

		if (nextIndex < this._splittedItems[this._arrayIndex].length) {
			this._itemIndex = nextIndex;
		} else {
			this._arrayIndex = this._findNextArrayIndex(1);
			this._itemIndex = 0;
		}
	}

	public select(item: T, arrayIndex: number) {
		this._itemIndex = this._splittedItems[arrayIndex].findIndex((i) => i.id === item.id);
		this._arrayIndex = arrayIndex;
	}

	public dequeue(item: T) {
		this._items = this._items.filter((i) => i.id !== item.id);
	}

	public enqueue(item: T) {
		this._items.push(item);
	}

	private _findNextArrayIndex(direction: 1 | -1) {
		for (let i = 1; i < this._splittedItems.length; i++) {
			const index = (this._arrayIndex + i * direction + this._splittedItems.length) % this._splittedItems.length;

			if (this._splittedItems[index].length > 0) {
				return index;
			}
		}

		return this._arrayIndex;
	}

	private _splitByValue() {
		const result: T[][] = this._values.map(() => []);
		const sortedValues = [...this._values].sort((a, b) => a - b);

		for (const item of this._items) {
			const poolIndex = sortedValues.findIndex((val, index) => {
				const nextPrice = sortedValues[index + 1];
				return nextPrice === undefined
					? item.value >= val
					: item.value >= val && item.value < nextPrice;
			});

			if (poolIndex !== -1) {
				result[poolIndex].push(item);
			}
		}

		return result;
	}

	private _getRandomItems() {
		const items = Array.from({ length: Math.random() * 100 }, () => ({
			id: crypto.randomUUID() as string,
			title: `${crypto.randomUUID().slice(0, 5)}`,
			value: Math.floor(Math.random() * 1000),
			preview: 'https://i.ytimg.com/vi/GkG60kISnfc/hqdefault.jpg?sqp=-oaymwEmCKgBEF5IWvKriqkDGQgBFQAAiEIYAdgBAeIBCggYEAIYBjgBQAE=&rs=AOn4CLC838QzSTZsByv8P3WDpvj0PR2XTQ'
		} as unknown as QueueItemData));

		return items.filter((i) => (i.value || 0) >= Math.min(...this._values));
	}

	get values() { return this._values }
	get items() { return this._items }
	get splittedItems() { return this._splittedItems }
	get itemIndex() { return this._itemIndex }
	get arrayIndex() { return this._arrayIndex }
	get size() { return this._items.length }
	get isEmpty() { return this._items.length === 0 }
}

