import Dexie, { liveQuery, type EntityTable } from 'dexie';
import type { QueueItemData } from './types';

type DBSchema = Dexie & {
	queueItems: EntityTable<QueueItemData, 'id'>;
}

const dexieDB = new Dexie('Database') as DBSchema;

dexieDB.version(1).stores({
	queueItems: '++id, videoId, title, channelTitle, value',
});
console.log(`db version: ${dexieDB.verno}`)

class DexieDB {
	private _db: DBSchema;

	constructor(db: DBSchema) {
		this._db = db;
	}

	public async getQueueItems() {
		return await this._db.queueItems.toArray();
	}

	public async removeQueueItem(item: QueueItemData) {
		await this._db.queueItems.delete(item.id);
	}

	public async getQueueItem(videoId: string) {
		return await this._db.queueItems.where({ videoId }).first();
	}

	public async updateQueueItem(item: QueueItemData, username: string) {
		const hasUserSubmittedBefore = item.submittedBy.includes(username);

		if (hasUserSubmittedBefore) return;

		return await this._db.queueItems.update(item.id, {
			submittedBy: [...item.submittedBy, username]
		});
	}

	public async addQueueItem(item: Omit<QueueItemData, "id">) {
		return await this._db.queueItems.add(item);
	}

	public async subscribe(cb: (items: QueueItemData[]) => void) {
		liveQuery(async () => await db.queueItems.toArray())
			.subscribe(cb);
	}

	get queueItems() { return this._db.queueItems }
}

const db = new DexieDB(dexieDB);
export default db;