import type { YouTubePlayer } from 'youtube-player/dist/types';
import queue from './queue';
import settings from './settings';
import type { IQueueVideoInfo } from '$lib/interfaces';
import timer from './timer';
import { YOUTUBE_PLAYER_STATE } from '$lib/constants';

function createVideoPlayer() {
  let player: YouTubePlayer;
  let videos: IQueueVideoInfo[] = [];
  let shouldAutoplay: boolean;
  let shouldPlayNextVideo: boolean;
  let currentVideo: IQueueVideoInfo;
  let prevPlayerState: YOUTUBE_PLAYER_STATE;
  let timerType: 'fixed' | 'perMinute';

  function initialize(playerInstance: YouTubePlayer) {
    _initializePlayer(playerInstance);
    _subscribeToStores();
  }

  function _initializePlayer(playerInstance: YouTubePlayer) {
    player = playerInstance;

    player.on('stateChange', _onPlayerStateChange);

    if (videos[0]) {
      player.cueVideoById(videos[0]);
      queue.setCurrent(videos[0]);
    }
  }

  async function getVideoUrl() {
    return await player.getVideoUrl();
  }

  function _subscribeToStores() {
    settings.player.subscribe((store) => {
      shouldAutoplay = store.shouldAutoplay;
      shouldPlayNextVideo = store.shouldPlayNextVideo;
    });
    settings.timer.subscribe((store) => timerType = store.type);
    queue.subscribe((v) => videos = v);
    queue.currentVideo.subscribe(_onCurrentVideoUpdate);
  }

  async function _onPlayerStateChange(e: CustomEvent<unknown> & { data: YOUTUBE_PLAYER_STATE }) {
    // console.log(e.data);

    switch (e.data) {
      case YOUTUBE_PLAYER_STATE.UNSTARTED: {
        timer.reset();
        if (!currentVideo.endSeconds) break;

        const secondsDiff = currentVideo.endSeconds - currentVideo.startSeconds;
        const remainingTime = currentVideo.endSeconds ? secondsDiff : 0;

        if (timerType === 'perMinute') timer.setTime(remainingTime * 1000);
        break;
      }
      case YOUTUBE_PLAYER_STATE.ENDED: {
        if (prevPlayerState === YOUTUBE_PLAYER_STATE.PLAYING && shouldPlayNextVideo) queue.setNext();
        break;
      }
      case YOUTUBE_PLAYER_STATE.PLAYING: {
        if (!currentVideo.endSeconds) break;

        timer.start();
        break;
      }
      case YOUTUBE_PLAYER_STATE.PAUSED: {
        if (!currentVideo.endSeconds) break;

        timer.pause();
        break;
      }
      case YOUTUBE_PLAYER_STATE.BUFFERING: {
        if (prevPlayerState === YOUTUBE_PLAYER_STATE.UNSTARTED) {
          setTimeout(async () => await player.seekTo(currentVideo.startSeconds, true), 30);
        }

        // if (currentVideo.endSeconds) {
        //   const currentTime = await player.getCurrentTime();
        //   const remainingTime = currentVideo.endSeconds ? currentVideo.endSeconds - currentTime : 0;

        //   console.log('currentTime:', currentTime, 'endTime:', currentVideo.endSeconds, 'remainingTime:', remainingTime);
        //   timer.reset();
        //   timer.setTime(remainingTime * 1000);
        // }

        break;
      }
      case YOUTUBE_PLAYER_STATE.VIDEO_CUED: {
        break;
      }
    }

    prevPlayerState = e.data;
  }

  async function _onCurrentVideoUpdate(video: IQueueVideoInfo | undefined) {
    if (!video) {
      await player.stopVideo();
      return;
    };

    const { videoId, startSeconds, endSeconds } = video;

    if (shouldAutoplay) {
      await player.loadVideoById({ videoId, startSeconds, endSeconds });
    } else {
      await player.cueVideoById({ videoId, startSeconds, endSeconds });
    }

    currentVideo = video;
  }

  return {
    initialize,
    getVideoUrl,
  }
}

const videoPlayer = createVideoPlayer();

export default videoPlayer;