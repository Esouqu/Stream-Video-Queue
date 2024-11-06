import type { IQueueVideoInfo, IVideoData } from '$lib/interfaces';
import { derived, get, writable, type Writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import settings from './settings';
import db from '$lib/db';
import { insertRandomly } from '$lib/utils';

type VideoDataType = Pick<IQueueVideoInfo, 'videoId' | 'price' | 'message' | 'username' | 'startSeconds' | 'endSeconds' | 'isPaid'>;

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

  let shouldAddRandomly: boolean;
  let shouldDeletePreviousVideos: boolean;

  async function initialize() {
    await loadVideosFromDb();

    settings.queue.subscribe((store) => {
      shouldAddRandomly = store.shouldAddRandomly;
      shouldDeletePreviousVideos = store.shouldDeletePreviousVideo;
    });
  }

  async function add(videoData: VideoDataType) {
    if (submittedVideoIds.has(videoData.videoId) && !videoData.isPaid) return;

    const store = videoData.isPaid ? paidVideos : freeVideos;
    const video = await getVideo(videoData);

    if (!video) return;

    addVideoToStore(store, video);

    if (!videoData.isPaid) submittedVideoIds.add(videoData.videoId);

    await db.videos.add(video);
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

  function addVideoToStore(store: Writable<IQueueVideoInfo[]>, video: IQueueVideoInfo) {
    const videos = get(freeAndPaidVideos);

    store.update((items) => {
      let newItems: IQueueVideoInfo[] = [];

      if (shouldAddRandomly && items.length > 1) {
        newItems = insertRandomly(items, video);
      } else {
        newItems = [...items, video];
      }

      if (videos.length < 1) setCurrent(newItems[0]);

      return newItems;
    });
  }

  async function getVideo(videoData: VideoDataType): Promise<IQueueVideoInfo | undefined> {
    const res = await fetch(`api/youtube?video_id=${videoData.videoId}`).then((res) => res);

    if (res.ok) {
      const { snippet } = await res.json().then((data: IVideoData) => data.items[0]);

      return {
        id: uuidv4(),
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        thumbnail: snippet.thumbnails.medium.url,
        isWatched: false,
        ...videoData,
      }
    }
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