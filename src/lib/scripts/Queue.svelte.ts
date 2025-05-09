import type { IQueueItem } from '$lib/interfaces';
import db from '$lib/db';
import { liveQuery } from 'dexie';
import { browser } from '$app/environment';
import { storable, type LocalStore } from './LocalStore.svelte';
import { getRandomIndex } from '$lib/utils';

class Queue {
  private _settings = storable({
    shouldPlayRandomly: false,
    shouldHideWatched: false,
  }, 'queueSettings');

  private _items: IQueueItem[] | undefined = $state();
  private _current: LocalStore<IQueueItem | null> = storable(null, 'currentVideo');
  private _previous: IQueueItem | null = $state(null);
  public sortedItems = $derived.by(this._sortItemsByDonation.bind(this));
  public unseen = $derived(this.sortedItems?.filter((item) => !item.isWatched));
  public count = $derived(this._items?.length);
  public currentIndex = $derived.by(this._getCurrentIndex.bind(this));

  constructor() {
    if (browser) {
      liveQuery(async () => await db.queueItems.toArray())
        .subscribe((items) => this._items = items);
    }
  }

  public async add(item: Omit<IQueueItem, 'id' | 'isWatched'>) {
    const existingItem = this._items?.find(
      (existing) => existing.videoId === item.videoId
    );

    if (existingItem) {
      await this._updateItemSubmition(existingItem, item);
    } else {
      await db.queueItems.add({ ...item, isWatched: false });
    }
  }

  public async removePrevious() {
    if (this._previous) {
      await db.queueItems.delete(this._previous.id);
    }
  }

  public async remove(itemId: number) {
    await db.queueItems.delete(itemId);
  }

  public clear() {
    this.setCurrent(null);
    db.queueItems.clear();
  }

  public next() {
    const items = this._getItemsForNext();

    if (!items) return;

    const currentIndex = items.findIndex((item) => item.id === this._current.value?.id);
    const nextItem = this._getNextItem(items, currentIndex);

    if (nextItem) {
      this.setCurrent(nextItem);
    } else {
      this.setCurrent(null);
    }
  }

  public async setCurrent(item: IQueueItem | null) {
    this._previous = this._current.value;

    if (this._previous) {
      await db.queueItems.update(this._previous.id, { isWatched: true });
    }

    this._current.value = item;
  }

  private async _updateItemSubmition(existingItem: IQueueItem, newItem: Omit<IQueueItem, 'id' | 'isWatched'>) {
    const newUser = newItem.submittedBy[0];
    const hasUserSubmittedBefore = existingItem.submittedBy.includes(newUser);

    existingItem.donationAmount += newItem.donationAmount;

    if (!hasUserSubmittedBefore) {
      existingItem.submittedBy.push(newUser);
    }

    await db.queueItems.update(existingItem.id, {
      donationAmount: existingItem.donationAmount,
      submittedBy: existingItem.submittedBy.slice() // create a clone to avoid DataCloneError
    });
  }

  private _getCurrentIndex() {
    const items = this.shouldHideWatched ? this.unseen : this._items;

    return items?.findIndex((item) => item.id === this._current.value?.id);
  }

  private _getItemsForNext(): IQueueItem[] | undefined {
    const items = this.unseen;

    if (!items || items.length <= 1) {
      this.shouldHideWatched = false;
      return this._items;
    }

    return items;
  }

  private _getNextIndex(items: IQueueItem[], currentIndex: number) {
    let nextIndex = currentIndex + 1;

    if (this.shouldPlayRandomly) {
      do {
        nextIndex = getRandomIndex(items);
      } while (nextIndex === currentIndex && items.length > 1);
    }

    return nextIndex;
  }

  private _getNextItem(items: IQueueItem[], currentIndex: number) {
    const nextIndex = this._getNextIndex(items, currentIndex);
    return items[nextIndex % items.length];
  }

  private _sortItemsByDonation() {
    return this._items?.sort((a, b) => {
      const aDonation = a.donationAmount > 0;
      const bDonation = b.donationAmount > 0;

      if (aDonation && !bDonation) return -1;
      if (!aDonation && bDonation) return 1;

      const aSubmittedByLength = a.submittedBy.length;
      const bSubmittedByLength = b.submittedBy.length;

      if (aSubmittedByLength !== bSubmittedByLength) {
        return bSubmittedByLength - aSubmittedByLength;
      }

      return a.id - b.id;
    });
  }

  get items() { return this._items; }
  get current() { return this._current.value; }
  get previous() { return this._previous; }
  get shouldPlayRandomly() { return this._settings.value.shouldPlayRandomly; }
  set shouldPlayRandomly(val: boolean) { this._settings.value.shouldPlayRandomly = val; }
  get shouldHideWatched() { return this._settings.value.shouldHideWatched; }
  set shouldHideWatched(val: boolean) { this._settings.value.shouldHideWatched = val; }
}

export default Queue;
