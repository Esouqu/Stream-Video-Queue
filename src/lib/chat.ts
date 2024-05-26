import { get, writable } from 'svelte/store';
import tmi from 'tmi.js';
import queue from './stores/queue';
import { CHAT_STATE } from './constants';
import type { IUserInput } from './interfaces';
import votes from './stores/votes';
import settings from './stores/settings';
import { extractKeyword, extractYoutubeVideoData } from './utils';
import twitchApi from './twitchApi';

function createChat() {
  const state = writable<CHAT_STATE>(CHAT_STATE.NOT_EXISTS);
  const viewCount = writable(0);
  const votedUsernames = new Set();
  const viewCountRefreshRate = 2000 * 60;

  let isVotesEnabled = false;
  let isLinksEnabled = false;
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

      if (videoData && isLinksEnabled) {
        queue.add({
          username,
          message,
          price: 0,
          isPaid: false,
          ...videoData,
        });
      } else if (keyword && !votedUsernames.has(username) && isVotesEnabled) {
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
    settings.isLinksEnabled.subscribe((store) => isLinksEnabled = store);
    settings.isVotesEnabled.subscribe((store) => isVotesEnabled = store);
    // settings.isPaidVideosSkippable.subscribe((store) => isPaidVideosSkippable = store);
    settings.isAutodetection.subscribe(async (isEnabled) => {
      if (!isEnabled) {
        clearInterval(intervalId);
        return;
      };

      _setViewCount();

      intervalId = setInterval(async () => {
        if (get(state) !== CHAT_STATE.CONNECTED) return;

        await _setViewCount(intervalId);
      }, viewCountRefreshRate);
    });

    queue.currentVideo.subscribe(() => {
      votedUsernames.clear();
      votes.resetCounter();
    });
  }

  async function _setViewCount(intervalId?: number) {
    const user = await twitchApi.getUser();

    if (user) {
      viewCount.set(user.view_count <= 1 ? 1 : user.view_count);
    } else {
      settings.isAutodetection.set(false);
      if (intervalId) clearInterval(intervalId);
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