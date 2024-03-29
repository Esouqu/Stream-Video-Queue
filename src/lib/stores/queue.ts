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
  const submittedVideoIds: Set<string> = new Set();

  let isAddRandomly: boolean;

  async function initialize() {
    const paid = await db.videos.filter((item) => item.isPaid === true).toArray();
    const free = await db.videos.filter((item) => item.isPaid === false).toArray();

    paidVideos.set(paid);
    freeVideos.set(free);

    for (const item of [...paid, ...free]) {
      submittedVideoIds.add(item.videoId);
    }

    if (paid.length > 0 || free.length > 0) setNext();

    settings.isAddRandomly.subscribe((store) => isAddRandomly = store);
  }

  async function add(videoData: { videoId: string, timing?: number }, username: string, isPaid: boolean) {
    if (submittedVideoIds.has(videoData.videoId) && !isPaid) return;

    const videos = get(freeAndPaidVideos);
    const store = isPaid ? paidVideos : freeVideos;
    const { snippet } = await fetch(`api/youtube?video_id=${videoData.videoId}`)
      .then((res) => res.json())
      .then((data: IVideoData) => data.items[0]);
    const item: IQueueVideoInfo = {
      id: uuidv4(),
      isPaid,
      videoId: videoData.videoId,
      timing: videoData.timing,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      thumbnail: snippet.thumbnails.medium.url,
      username,
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

    if (!isPaid) submittedVideoIds.add(videoData.videoId);

    await db.videos.add(item);
  }

  function setNext() {
    currentVideo.update((item) => {
      const allVideos = get(freeAndPaidVideos);
      const currentVideoIndex = allVideos.findIndex((item) => item.id === item?.id);
      const downVideo = allVideos[currentVideoIndex + 1];

      if (!item) return allVideos[0];

      if (item) {
        remove(item);

        if (item.id !== allVideos[0].id) return allVideos[0];
      }

      if (downVideo) return downVideo;
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

  return {
    subscribe: freeAndPaidVideos.subscribe,
    currentVideo,
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