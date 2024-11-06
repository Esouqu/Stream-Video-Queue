import { writable } from 'svelte/store';
import tmi from 'tmi.js';
import queue from './queue';
import { CHAT_STATE } from '../constants';
import type { IUserInput } from '../interfaces';
import votes from './votes';
import settings from './settings';
import { extractKeyword, extractYoutubeVideoData } from '../utils';

function createChat() {
  const state = writable<CHAT_STATE>(CHAT_STATE.NOT_EXISTS);
  const votedUsernames = new Set();

  let isVotesEnabled = false;
  let isLinksEnabled = false;
  let votesInput: IUserInput;
  let client: tmi.Client;

  function connect(channelId: string) {
    state.set(CHAT_STATE.CONNECTING);

    client = new tmi.Client({ channels: [channelId] });

    client.on('connected', () => state.set(CHAT_STATE.CONNECTED));
    client.on('message', (_channel, tags, message) => {
      const keywords = [votesInput.keepKeyword, votesInput.skipKeyword];
      // special symbols like ':', ')' etc. are not supported
      const keyword = extractKeyword(message, keywords);
      const videoData = extractYoutubeVideoData(message);
      const username = tags['display-name'] || tags.username || '???';

      if (videoData && isLinksEnabled) {
        queue.add({
          ...videoData,
          username,
          message,
          price: 0,
          isPaid: false,
        });
      } else if (keyword && !votedUsernames.has(username) && isVotesEnabled) {
        votedUsernames.add(username);
        votes.addVote(keyword);
      }
    });
    client.on('disconnected', () => state.set(CHAT_STATE.DISCONNECTED));

    client.connect();
    _initializeSubscriptions();
  }

  function disconnect() {
    client.disconnect();
    state.set(CHAT_STATE.DISCONNECTED);
  }

  function _initializeSubscriptions() {
    settings.twitch.subscribe((store) => {
      votesInput = store.votes;
      isVotesEnabled = store.isVotesEnabled;
      isLinksEnabled = store.isLinksEnabled;
    });

    queue.currentVideo.subscribe(() => {
      votedUsernames.clear();
      votes.resetCounter();
    });
  }

  return {
    state,
    connect,
    disconnect,
  }
}

const chat = createChat();

export default chat;