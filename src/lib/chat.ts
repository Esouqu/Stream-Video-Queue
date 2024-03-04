import { get, writable } from 'svelte/store';
import tmi from 'tmi.js';
import queue from './stores/queue';
import { CHAT_STATE } from './constants';
import type { ITwitchUserData, IUserInput } from './interfaces';
import votes from './stores/votes';
import settings from './stores/settings';
import { extractKeyword, extractYoutubeVideoData } from './utils';

function createChat() {
  const state = writable<CHAT_STATE>(CHAT_STATE.NOT_EXISTS);
  const viewCount = writable(0);
  const votedUsernames = new Set();
  const VIEW_COUNT_REFRESH_RATE = 2000 * 60;

  let client: tmi.Client;
  let votesKeywords: IUserInput;
  let intervalId: number;

  function initialize(channelId: string) {
    client = new tmi.Client({ channels: [channelId] });

    connect();

    client.on('connected', () => state.set(CHAT_STATE.CONNECTED));
    client.on('message', (_channel, tags, message) => {
      const keywords = [votesKeywords.keepKeyword, votesKeywords.skipKeyword];
      const keyword = extractKeyword(message, keywords);
      const videoData = extractYoutubeVideoData(message);
      const username = tags['display-name'] || tags.username || '???';

      if (videoData) {
        queue.add(videoData, username, false);
      } else if (keyword && !votedUsernames.has(username)) {
        votedUsernames.add(username);
        votes.addVote(keyword);
      }
    });
    client.on('disconnected', () => state.set(CHAT_STATE.DISCONNECTED));

    _initializeSubscriptions();
  }

  function disconnet() {
    client.disconnect();
    state.set(CHAT_STATE.DISCONNECTED);
  }

  function connect() {
    state.set(CHAT_STATE.CONNECTING);
    client.connect();
  }

  function _initializeSubscriptions() {
    settings.userInput.subscribe((store) => votesKeywords = store);

    settings.isAutodetection.subscribe(async (isEnabled) => {
      if (!isEnabled) {
        clearInterval(intervalId);
        return;
      };

      _setViewCount();

      intervalId = setInterval(async () => {
        if (get(state) !== CHAT_STATE.CONNECTED) {
          clearInterval(intervalId);
          return;
        }

        _setViewCount(intervalId);
      }, VIEW_COUNT_REFRESH_RATE);
    });

    queue.currentVideo.subscribe(() => {
      votedUsernames.clear();
      votes.resetCounter();
    });
  }

  async function _setViewCount(intervalId?: number) {
    const userViewCount = await _fetchViewCount();

    if (typeof userViewCount === 'number') {
      viewCount.set(userViewCount <= 1 ? 1 : userViewCount);
      console.log(userViewCount <= 1 ? 1 : userViewCount);
    } else {
      settings.isAutodetection.set(false);
      if (intervalId) clearInterval(intervalId);
    }
  }

  async function _fetchViewCount() {
    const validationResponse = await fetch('/api/twitch/validate')
      .then((res) => res);
    let refreshTokenResponse: Response | undefined;

    if (validationResponse.status === 401 || validationResponse.status === 400) {
      refreshTokenResponse = await fetch('/api/twitch/refresh', {
        method: 'POST'
      }).then((res) => res);
    }

    if (validationResponse.status === 200 || refreshTokenResponse?.status === 200) {
      const user = await fetch('/api/twitch/user')
        .then((res) => res.json())
        .then((data: ITwitchUserData) => data);

      return user.view_count;
    }
  }

  return {
    initialize,
    state,
    viewCount,
    connect,
    disconnet,
  }
}

const chat = createChat();

export default chat;