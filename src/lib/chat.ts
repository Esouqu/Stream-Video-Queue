import { writable } from 'svelte/store';
import tmi from 'tmi.js';
import queue from './stores/queue';
import { CHAT_STATE } from './constants';
import type { ITwitchUserData, IUserInput } from './interfaces';
import votes from './stores/votes';
import { findKeyword, findYoutubeVideoId } from './utils';
import settings from './stores/settings';

function createChat() {
  const state = writable<CHAT_STATE>(CHAT_STATE.NOT_EXISTS);
  const viewCount = writable(0);
  const votedUsernames = new Set();
  const NEEDED_VOTES_REFRESH_RATE = 2000 * 60;

  let client: tmi.Client;
  let votesKeywords: IUserInput;
  let intervalId: number;

  function initialize(channelId: string) {
    client = new tmi.Client({ channels: [channelId] });

    connect();

    client.on('connected', () => state.set(CHAT_STATE.CONNECTED));
    client.on('message', (_channel, tags, message) => {
      const keywords = [votesKeywords.keepKeyword, votesKeywords.skipKeyword];
      const keyword = findKeyword(message, keywords);
      const videoId = findYoutubeVideoId(message);

      let username: string;

      if (tags['display-name']) username = tags['display-name']
      else if (tags.username) username = tags.username
      else username = '???';

      if (videoId) {
        queue.add(videoId, username);
      } else if (videoId?.length !== 11 && keyword && !votedUsernames.has(username)) {
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
    settings.userInput.subscribe((store) => {
      votesKeywords = store;
    });

    settings.isAutodetection.subscribe(async (isEnabled) => {
      if (isEnabled) {
        await _fetchViewCount();

        intervalId = setInterval(async () => {
          await _fetchViewCount();
        }, NEEDED_VOTES_REFRESH_RATE);

      } else {
        clearInterval(intervalId);
      }
    });

    queue.currentVideo.subscribe(() => {
      votedUsernames.clear();
      votes.resetCounter();
    });
  }

  async function _fetchViewCount() {
    const secondFetchData = await fetch('/api/twitch/user')
      .then((res) => res.json())
      .then((data: ITwitchUserData) => data);

    viewCount.set(secondFetchData.view_count)
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