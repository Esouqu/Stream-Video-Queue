import Dexie, { type Table } from 'dexie';
import type { IQueueVideoInfo } from './interfaces';

class Database extends Dexie {
  readonly videos!: Table<IQueueVideoInfo>;

  constructor() {
    super('Database');
    this.version(1).stores({
      videos: 'id, videoId, title, channelTitle, thumbnail, username, isPaid, isWatched, timing, price, message',
    });
  }
}

const db = new Database();

export default db;