import type { IQueueVideoInfo, IVideoData } from '$lib/interfaces';
import { derived, get, writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import settings from './settings';
import db from '$lib/db';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const testArray = Array.from(new Array(110), (_, id) => {
//   return {
//     "videoId": "36z1ZxSOSRc",
//     "title": "✨💫🪐 YAMEII / deko ✿❀ Mix🌛🌈❄️🌊",
//     "channelTitle": "ChanceMixes",
//     "thumbnail": "https://i.ytimg.com/vi/36z1ZxSOSRc/default.jpg",
//     "username": "anon",
//     "id": uuidv4(),
//     "isPaid": false,
//   }
// });

// const testArray = [
//   {
//     "videoId": "36z1ZxSOSRc",
//     "title": "✨💫🪐 YAMEII / deko ✿❀ Mix🌛🌈❄️🌊",
//     "channelTitle": "ChanceMixes",
//     "thumbnail": "https://i.ytimg.com/vi/36z1ZxSOSRc/default.jpg",
//     "username": "anonqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
//     "id": '1',
//     "isPaid": false,
//   },
//   {
//     "videoId": "7lo0JH45u54",
//     "title": "She look like she would 😳",
//     "channelTitle": "NLE CHOPPA",
//     "thumbnail": "https://i.ytimg.com/vi/7lo0JH45u54/default.jpg",
//     "username": "anon",
//     "id": '2',
//     "isPaid": false,
//   },
//   {
//     "videoId": "uDAZmwwcP18",
//     "title": "nu popstar ✩°｡‘ (* · *) ⸝",
//     "channelTitle": "Deko - Topic",
//     "thumbnail": "https://i.ytimg.com/vi/uDAZmwwcP18/default.jpg",
//     "username": "anon",
//     "id": '3',
//     "isPaid": false,
//   },
//   {
//     "videoId": "ORt47Py5x5o",
//     "title": "University Accused of Selling Student Papers for LLM Data",
//     "channelTitle": "ThePrimeTime",
//     "thumbnail": "https://i.ytimg.com/vi/ORt47Py5x5o/default.jpg",
//     "username": "anon",
//     "id": '4',
//     "isPaid": false,
//   },
//   {
//     "videoId": "AjwAdtlRKf8",
//     "title": "Buy Feastables, Win $10,000",
//     "channelTitle": "MrBeast",
//     "thumbnail": "https://i.ytimg.com/vi/AjwAdtlRKf8/default.jpg",
//     "username": "anon",
//     "id": '5',
//     "isPaid": false,
//   },
//   {
//     "videoId": "hD4sz0XufWE",
//     "title": "Стримушка ТВ - Ноябрь 2023 кратко",
//     "channelTitle": "Стримушка",
//     "thumbnail": "https://i.ytimg.com/vi/hD4sz0XufWE/default.jpg",
//     "username": "anon",
//     "id": '6',
//     "isPaid": false,
//   },
//   {
//     "videoId": "jCE34DMLBRQ",
//     "title": "SALUKI — VENTONYL (feat. Toxi$)",
//     "channelTitle": "SALUKI",
//     "thumbnail": "https://i.ytimg.com/vi/jCE34DMLBRQ/mqdefault.jpg",
//     "username": "anon",
//     "id": '7',
//     "isPaid": false,
//   },
// ]

// const testArray2 = [
//   {
//     "videoId": "36z1ZxSOSRc",
//     "title": "✨💫🪐 YAMEII / deko ✿❀ Mix🌛🌈❄️🌊",
//     "channelTitle": "ChanceMixes",
//     "thumbnail": "https://i.ytimg.com/vi/36z1ZxSOSRc/default.jpg",
//     "username": "anonqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
//     "id": '8',
//     "isPaid": true,
//   },
//   {
//     "videoId": "7lo0JH45u54",
//     "title": "She look like she would 😳",
//     "channelTitle": "NLE CHOPPA",
//     "thumbnail": "https://i.ytimg.com/vi/7lo0JH45u54/default.jpg",
//     "username": "anon",
//     "id": '9',
//     "isPaid": true,
//   },
//   {
//     "videoId": "uDAZmwwcP18",
//     "title": "nu popstar ✩°｡‘ (* · *) ⸝",
//     "channelTitle": "Deko - Topic",
//     "thumbnail": "https://i.ytimg.com/vi/uDAZmwwcP18/default.jpg",
//     "username": "anon",
//     "id": '10',
//     "isPaid": true,
//   },
// ]

function createQueue() {
  const freeVideos = writable<IQueueVideoInfo[]>([]);
  const paidVideos = writable<IQueueVideoInfo[]>([]);
  const freeAndPaidVideos = derived(
    [freeVideos, paidVideos],
    ([$freeVideos, $paidVideos]) => [...$paidVideos, ...$freeVideos]
  );
  const currentVideo = writable<IQueueVideoInfo | undefined>();
  const isLoading = writable(true);
  const submittedVideoIds: Set<string> = new Set();

  let isAddRandomly: boolean;
  let shouldDeletePreviousVideos: boolean;

  async function initialize() {
    await loadVideosFromDb();

    settings.isAddRandomly.subscribe((store) => isAddRandomly = store);
    settings.shouldDeletePreviousVideos.subscribe((store) => shouldDeletePreviousVideos = store);
  }

  async function add(videoData: Pick<IQueueVideoInfo, 'videoId' | 'timing' | 'price' | 'message' | 'username' | 'isPaid'>) {
    if (submittedVideoIds.has(videoData.videoId) && !videoData.isPaid) return;

    const videos = get(freeAndPaidVideos);
    const store = videoData.isPaid ? paidVideos : freeVideos;
    const { snippet } = await fetch(`api/youtube?video_id=${videoData.videoId}`)
      .then((res) => res.json())
      .then((data: IVideoData) => data.items[0]);
    const item: IQueueVideoInfo = {
      id: uuidv4(),
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      thumbnail: snippet.thumbnails.medium.url,
      isWatched: false,
      ...videoData,
    }

    store.update((items) => {
      let newItems: IQueueVideoInfo[] = [];

      if (isAddRandomly && items.length > 1) {
        const randomIdx = Math.floor(Math.random() * items.length);
        newItems = [...items.slice(0, randomIdx), item, ...items.slice(randomIdx)];
      } else {
        newItems = [...items, item];
      }

      if (videos.length < 1) setCurrent(newItems[0]);

      return newItems;
    });

    if (!videoData.isPaid) submittedVideoIds.add(videoData.videoId);

    await db.videos.add(item);
  }

  function setNext() {
    currentVideo.update((prevVideo) => {
      const allVideos = get(freeAndPaidVideos);
      const currentVideoIndex = allVideos.findIndex((item) => item.id === prevVideo?.id);
      const downVideo = allVideos[currentVideoIndex + 1];

      if (prevVideo) {
        const store = prevVideo.isPaid ? paidVideos : freeVideos;

        store.update((items) => items.map((item) => {
          if (item.id !== prevVideo.id) return item;
          return { ...item, isWatched: true };
        }));
        db.videos.update(prevVideo.id, { isWatched: true });

        if (shouldDeletePreviousVideos) remove(prevVideo);
        if (downVideo) return downVideo;
      }

      return allVideos[0];
    });
  }

  function setCurrent(video: IQueueVideoInfo | undefined) {
    currentVideo.set(video);
  }

  async function remove(video: IQueueVideoInfo) {
    const store = video.isPaid ? paidVideos : freeVideos;

    store.update((items) => items.filter((item) => item.id !== video.id));

    if (!video.isPaid) submittedVideoIds.delete(video.videoId);

    await db.videos.delete(video.id);
  }

  async function removeAll() {
    freeVideos.set([]);
    paidVideos.set([]);
    submittedVideoIds.clear();
    setCurrent(undefined);

    await db.videos.clear();
  }

  async function loadVideosFromDb() {
    isLoading.set(true);

    const paid = await db.videos.filter((item) => item.isPaid === true).toArray();
    const free = await db.videos.filter((item) => item.isPaid === false).toArray();

    paidVideos.set(paid);
    freeVideos.set(free);

    for (const item of [...paid, ...free]) {
      submittedVideoIds.add(item.videoId);
    }

    if (paid.length > 0 || free.length > 0) setNext();

    isLoading.set(false);
  }

  return {
    subscribe: freeAndPaidVideos.subscribe,
    currentVideo,
    isLoading,
    initialize,
    add,
    remove,
    removeAll,
    setCurrent,
    setNext
  }
}

const queue = createQueue();

export default queue;