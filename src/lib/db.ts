import Dexie, { type EntityTable } from 'dexie';
import type { QueueItemData } from './types';

export type DBSchema = Dexie & {
	queueItems: EntityTable<QueueItemData, 'id'>;
}

const dexieDB = new Dexie('Database') as DBSchema;

dexieDB.version(1).stores({
	queueItems: '++id, videoId, sortOrder',
});
console.log(`db version: ${dexieDB.verno}`);

export default dexieDB;