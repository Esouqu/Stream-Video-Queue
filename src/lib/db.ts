import Dexie, { type EntityTable } from 'dexie';
import type { IQueueItem } from './interfaces';

const db = new Dexie('Database') as Dexie & {
  videos: EntityTable<IQueueItem, 'id'>;
  queueItems: EntityTable<IQueueItem, 'id'>;
};

db.version(3).stores({
  videos: null,
})

db.version(2).stores({
  queueItems: '++id, videoId, title, channelTitle, donationAmount',
}).upgrade(tx => {
  return tx.table("videos").toCollection().modify((video) => {
    const newItem: Omit<IQueueItem, 'id'> = {
      videoId: video.videoId,
      title: video.title,
      channelTitle: video.channelTitle,
      thumbnail: video.thumbnail,
      submittedBy: [video.username],
      isWatched: video.isWatched,
      startSeconds: video.timing || 0,
      donationAmount: video.price,
      message: video.message,
    }

    tx.table("queueItems").add(newItem);
  });
});

db.version(1).stores({
  videos: 'id, videoId, title, channelTitle, thumbnail, username, isPaid, isWatched, timing, price, message',
});

export default db;