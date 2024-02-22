import type { IQueueVideoInfo, IVideoData } from '$lib/interfaces';
import { get, writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import settings from './settings';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const testArray = Array.from(new Array(110), (_, id) => {
//   return {
//     "videoId": "36z1ZxSOSRc",
//     "title": "✨💫🪐 YAMEII / deko ✿❀ Mix🌛🌈❄️🌊",
//     "channelTitle": "ChanceMixes",
//     "thumbnail": "https://i.ytimg.com/vi/36z1ZxSOSRc/default.jpg",
//     "username": "anon",
//     "id": uuidv4()
//   }
// });
// const testArray = [
//   {
//     "videoId": "36z1ZxSOSRc",
//     "title": "✨💫🪐 YAMEII / deko ✿❀ Mix🌛🌈❄️🌊",
//     "channelTitle": "ChanceMixes",
//     "thumbnail": "https://i.ytimg.com/vi/36z1ZxSOSRc/default.jpg",
//     "username": "anonqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
//     "id": '1'
//   },
//   {
//     "videoId": "7lo0JH45u54",
//     "title": "She look like she would 😳",
//     "channelTitle": "NLE CHOPPA",
//     "thumbnail": "https://i.ytimg.com/vi/7lo0JH45u54/default.jpg",
//     "username": "anon",
//     "id": '2'
//   },
//   {
//     "videoId": "uDAZmwwcP18",
//     "title": "nu popstar ✩°｡‘ (* · *) ⸝",
//     "channelTitle": "Deko - Topic",
//     "thumbnail": "https://i.ytimg.com/vi/uDAZmwwcP18/default.jpg",
//     "username": "anon",
//     "id": '3'
//   },
//   {
//     "videoId": "ORt47Py5x5o",
//     "title": "University Accused of Selling Student Papers for LLM Data",
//     "channelTitle": "ThePrimeTime",
//     "thumbnail": "https://i.ytimg.com/vi/ORt47Py5x5o/default.jpg",
//     "username": "anon",
//     "id": '4'
//   },
//   {
//     "videoId": "AjwAdtlRKf8",
//     "title": "Buy Feastables, Win $10,000",
//     "channelTitle": "MrBeast",
//     "thumbnail": "https://i.ytimg.com/vi/AjwAdtlRKf8/default.jpg",
//     "username": "anon",
//     "id": '5'
//   },
//   {
//     "videoId": "hD4sz0XufWE",
//     "title": "Стримушка ТВ - Ноябрь 2023 кратко",
//     "channelTitle": "Стримушка",
//     "thumbnail": "https://i.ytimg.com/vi/hD4sz0XufWE/default.jpg",
//     "username": "anon",
//     "id": '6'
//   },
//   {
//     "videoId": "jCE34DMLBRQ",
//     "title": "SALUKI — VENTONYL (feat. Toxi$)",
//     "channelTitle": "SALUKI",
//     "thumbnail": "https://i.ytimg.com/vi/jCE34DMLBRQ/mqdefault.jpg",
//     "username": "anon",
//     "id": '7'
//   },
// ]

function createQueue() {
  const videos = writable<IQueueVideoInfo[]>([]);
  const currentVideo = writable<IQueueVideoInfo | undefined>();
  const videoIds: Set<string> = new Set();

  let isAddRandomly: boolean;

  function initialize() {
    settings.isAddRandomly.subscribe((store) => {
      isAddRandomly = store;
    });
  }

  async function add(videoId: string, username: string) {
    if (videoIds.has(videoId)) return;

    const { snippet } = await fetch(`api/youtube?video_id=${videoId}`)
      .then((res) => res.json())
      .then((data: IVideoData) => data.items[0]);
    const item: IQueueVideoInfo = {
      id: uuidv4(),
      videoId,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      thumbnail: snippet.thumbnails.medium.url,
      username
    }

    videos.update((items) => {
      if (isAddRandomly && items.length > 1) {
        const randomIdx = Math.floor(Math.random() * (items.length - 1)) + 1;
        const newItems = [...items.slice(0, randomIdx), item, ...items.slice(randomIdx)];

        if (items.length < 1) setCurrent(newItems[0]);

        return newItems;
      }

      const newItems = [...items, item];

      if (items.length < 1) setCurrent(newItems[0]);

      return newItems;
    });

    videoIds.add(videoId);
  }

  function setNext() {
    currentVideo.update((video) => {
      if (!video) return video;

      const videosArray = get(videos);
      const currentVideoIndex = videosArray.findIndex((item) => item.id === video.id);
      const downVideo = videosArray[currentVideoIndex - 1];
      const upVideo = videosArray[currentVideoIndex + 1];

      remove(video.videoId);

      if (downVideo) return downVideo
      else if (upVideo) return upVideo

      return undefined;
    });
  }

  function setCurrent(video: IQueueVideoInfo | undefined) {
    currentVideo.set(video);
  }

  // function removeFirst() {
  //   videos.update((items) => {
  //     const currentVid = get(currentVideo);
  //     const currentVideoIndex = items.findIndex((item) => item.id === currentVid?.id);
  //     const newItems = items.slice(1);

  //     if (currentVideoIndex === 0) setCurrent(newItems[0]);

  //     return newItems;
  //   });
  // }

  function remove(videoId: string) {
    videos.update((items) => {
      const newItems = items.filter((item) => item.videoId !== videoId);

      return newItems;
    });

    videoIds.delete(videoId);
  }

  function removeAll() {
    videos.set([]);
    videoIds.clear();
    setCurrent(undefined);
  }

  return {
    subscribe: videos.subscribe,
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