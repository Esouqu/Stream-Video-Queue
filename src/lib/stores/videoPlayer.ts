import type { YouTubePlayer } from 'youtube-player/dist/types';
import queue from './queue';
import settings from './settings';
import type { IQueueVideoInfo } from '$lib/interfaces';

function createVideoPlayer() {
  let player: YouTubePlayer;
  let videos: IQueueVideoInfo[] = [];
  let isAutoPlay: boolean;

  function initialize(playerInstance: YouTubePlayer) {
    player = playerInstance;

    playerInstance.on('stateChange', (e: CustomEvent<unknown> & { data: number }) => {
      if (e.data === 0) queue.setNext();
    });

    _initializeSubscriptions();

    if (videos[0]) {
      playerInstance.cueVideoById(videos[0]);
      queue.currentVideo.set(videos[0]);
    }
  }

  async function getVideoUrl() {
    return await player.getVideoUrl();
  }

  function _initializeSubscriptions() {
    settings.isAutoplay.subscribe((store) => isAutoPlay = store);

    queue.subscribe((v) => videos = v);

    queue.currentVideo.subscribe(async (video) => {
      if (!video) {
        await player.stopVideo();
        return;
      };

      if (isAutoPlay) {
        await player.loadVideoById(video.videoId, video.timing);
      } else {
        await player.cueVideoById(video.videoId, video.timing);
      }
    });
  }

  return {
    initialize,
    getVideoUrl,
  }
}

const videoPlayer = createVideoPlayer();

export default videoPlayer;