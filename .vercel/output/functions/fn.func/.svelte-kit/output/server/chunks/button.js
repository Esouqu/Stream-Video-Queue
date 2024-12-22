import { T as once, aa as run, R as setContext$1, ab as hasContext, ac as getContext$1, Q as push, S as pop, W as bind_props, V as spread_attributes, ad as rest_props, ae as fallback, X as ensure_array_like, a7 as element, a0 as slot, a1 as sanitize_props } from "./index2.js";
import tmi from "tmi.js";
import Dexie from "dexie";
import { clsx } from "clsx";
import parse from "style-to-object";
import { computePosition, offset, shift, limitShift, flip, size, arrow, hide, autoUpdate } from "@floating-ui/dom";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function remToPx(rem) {
  return 0;
}
function getRandomIndex(items) {
  return Math.floor(Math.random() * items.length);
}
function extractYoutubeVideoData(str) {
  const videoIdRegex = /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/)|youtu\.be\/|\/video\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})?/;
  const videoIdMatch = str.match(videoIdRegex);
  if (!videoIdMatch || !videoIdMatch[1]) return;
  const timingRegex = /&t=(\d+)/;
  const timingMatch = str.match(timingRegex);
  const startSeconds = timingMatch ? Number(timingMatch[1]) : 0;
  return { videoId: videoIdMatch[1], startSeconds };
}
function extractKeyword(str, keywords) {
  const keywordsRegex = new RegExp("(?<![a-zA-Z]|[а-яА-Я])(" + keywords.join("|") + ")(?![a-zA-Z]|[а-яА-Я])", "i");
  const matchedKeywords = str.match(keywordsRegex);
  if (matchedKeywords && matchedKeywords[0]) return toSentenceCase(matchedKeywords[0]);
}
function toSentenceCase(sentence) {
  if (!sentence) return "";
  const firstLetter = sentence.charAt(0).toUpperCase();
  const restOfSentence = sentence.slice(1).toLowerCase();
  return firstLetter + restOfSentence;
}
function msToHHMMSS(ms) {
  const hour = Math.floor(ms / 36e5);
  const min = Math.floor(ms % 36e5 / 6e4);
  const sec = Math.floor(ms % 6e4 / 1e3);
  return [
    String(hour).padStart(2, "0"),
    String(min).padStart(2, "0"),
    String(sec).padStart(2, "0")
  ].join(":");
}
class YoutubeApi {
  async getVideo(id) {
    const res = await fetch(`api/youtube/video?id=${id}`).then((res2) => res2);
    if (res.ok) {
      const { snippet } = await res.json().then((data) => data.items[0]);
      return {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        thumbnail: snippet.thumbnails.medium.url
      };
    }
  }
}
const youtubeApi = new YoutubeApi();
var INTEGRATION = /* @__PURE__ */ ((INTEGRATION2) => {
  INTEGRATION2["TWITCH"] = "twitch";
  INTEGRATION2["DONATIONALERTS"] = "donationalerts";
  return INTEGRATION2;
})(INTEGRATION || {});
var SOCKET_STATE = /* @__PURE__ */ ((SOCKET_STATE2) => {
  SOCKET_STATE2[SOCKET_STATE2["NOT_EXISTS"] = 0] = "NOT_EXISTS";
  SOCKET_STATE2[SOCKET_STATE2["OPEN"] = 1] = "OPEN";
  SOCKET_STATE2[SOCKET_STATE2["CLOSED"] = 2] = "CLOSED";
  SOCKET_STATE2[SOCKET_STATE2["CONNECTING"] = 3] = "CONNECTING";
  return SOCKET_STATE2;
})(SOCKET_STATE || {});
var TIMER_STATE = /* @__PURE__ */ ((TIMER_STATE2) => {
  TIMER_STATE2["UNSTARTED"] = "unstarted";
  TIMER_STATE2["PAUSED"] = "paused";
  TIMER_STATE2["RUNNING"] = "running";
  TIMER_STATE2["FINISHED"] = "finished";
  return TIMER_STATE2;
})(TIMER_STATE || {});
var YOUTUBE_PLAYER_STATE = /* @__PURE__ */ ((YOUTUBE_PLAYER_STATE2) => {
  YOUTUBE_PLAYER_STATE2[YOUTUBE_PLAYER_STATE2["UNSTARTED"] = -1] = "UNSTARTED";
  YOUTUBE_PLAYER_STATE2[YOUTUBE_PLAYER_STATE2["ENDED"] = 0] = "ENDED";
  YOUTUBE_PLAYER_STATE2[YOUTUBE_PLAYER_STATE2["PLAYING"] = 1] = "PLAYING";
  YOUTUBE_PLAYER_STATE2[YOUTUBE_PLAYER_STATE2["PAUSED"] = 2] = "PAUSED";
  YOUTUBE_PLAYER_STATE2[YOUTUBE_PLAYER_STATE2["BUFFERING"] = 3] = "BUFFERING";
  YOUTUBE_PLAYER_STATE2[YOUTUBE_PLAYER_STATE2["VIDEO_CUED"] = 5] = "VIDEO_CUED";
  return YOUTUBE_PLAYER_STATE2;
})(YOUTUBE_PLAYER_STATE || {});
class LocalStore {
  value;
  _key = "";
  constructor(value, key) {
    this._key = key;
    this.value = value;
  }
  _initializeValue() {
    const item = localStorage.getItem(this._key);
    if (item) {
      const deserializedValue = this._deserialize(item);
      if (deserializedValue) {
        this.value = deserializedValue;
      }
    } else {
      localStorage.setItem(this._key, this._serialize(this.value));
    }
  }
  _updateLocalStorage() {
    const currentSerializedValue = this._serialize(this.value);
    const existingItem = localStorage.getItem(this._key);
    if (existingItem !== currentSerializedValue) {
      localStorage.setItem(this._key, currentSerializedValue);
    }
  }
  _serialize(value) {
    return JSON.stringify(value);
  }
  _deserialize(item) {
    try {
      return JSON.parse(item);
    } catch {
      return void 0;
    }
  }
}
function storable(value, key) {
  return new LocalStore(value, key);
}
class Poll {
  _settings = storable(
    {
      isEnabled: false,
      neededVotes: 10,
      keepKeyword: "Оставить",
      skipKeyword: "Пропустить",
      shouldAutoSkip: false
    },
    "pollSettings"
  );
  _counter = { keep: 0, skip: 0 };
  #difference = once(() => this._counter.skip - this._counter.keep);
  get difference() {
    return this.#difference();
  }
  #currentPercent = once(this.calculateProgressBarPercentage.bind(this));
  get currentPercent() {
    return this.#currentPercent();
  }
  #isEnoughVotes = once(() => this.difference >= this._settings.value.neededVotes);
  get isEnoughVotes() {
    return this.#isEnoughVotes();
  }
  _votedUsers = /* @__PURE__ */ new Set();
  addKeep(username) {
    const isUserVoted = this._votedUsers.has(username);
    if (!isUserVoted) {
      this._counter.keep++;
    }
  }
  addSkip(username) {
    const isUserVoted = this._votedUsers.has(username);
    if (!isUserVoted) {
      this._counter.skip++;
    }
  }
  resetCounter() {
    this._counter = { keep: 0, skip: 0 };
    this._votedUsers.clear();
  }
  calculateProgressBarPercentage() {
    const normalizedVoteDifference = this.difference / this._settings.value.neededVotes * -50;
    const currentPercent = normalizedVoteDifference + 50;
    return currentPercent;
  }
  get keep() {
    return this._counter.keep;
  }
  get skip() {
    return this._counter.skip;
  }
  get isEnabled() {
    return this._settings.value.isEnabled;
  }
  set isEnabled(val) {
    this._settings.value.isEnabled = val;
  }
  get neededVotes() {
    return this._settings.value.neededVotes;
  }
  set neededVotes(val) {
    this._settings.value.neededVotes = val;
  }
  get keepKeyword() {
    return this._settings.value.keepKeyword;
  }
  set keepKeyword(val) {
    this._settings.value.keepKeyword = val;
  }
  get skipKeyword() {
    return this._settings.value.skipKeyword;
  }
  set skipKeyword(val) {
    this._settings.value.skipKeyword = val;
  }
  get shouldAutoSkip() {
    return this._settings.value.shouldAutoSkip;
  }
  set shouldAutoSkip(val) {
    this._settings.value.shouldAutoSkip = val;
  }
}
class Timer {
  _settings = storable(
    {
      isEnabled: false,
      pricePerSecond: 20,
      onStateFinishedAction: "pause"
    },
    "timerSettings"
  );
  _time = 0;
  _state = TIMER_STATE.UNSTARTED;
  #hhmmss = once(() => msToHHMMSS(this._time));
  get hhmmss() {
    return this.#hhmmss();
  }
  _currentTime = 0;
  _animationId = 0;
  _animationStartTime = 0;
  _animationPausedTime = 0;
  start(ms) {
    if (ms) this.setTime(ms);
    this._animationStartTime = performance.now() - this._animationPausedTime;
    this._state = TIMER_STATE.RUNNING;
    this._animationId = requestAnimationFrame(this.tick.bind(this));
  }
  pause() {
    if (this._state === TIMER_STATE.PAUSED || this._state === TIMER_STATE.UNSTARTED) return;
    cancelAnimationFrame(this._animationId);
    this._animationPausedTime = performance.now() - this._animationStartTime;
    this._state = TIMER_STATE.PAUSED;
  }
  add(ms) {
    this._currentTime += ms;
    this._time += ms;
  }
  subtract(ms) {
    this._time = this._time <= 0 ? 0 : Math.max(0, this._time - ms);
    this._currentTime -= ms;
  }
  reset() {
    this._resetTime();
    this._state = TIMER_STATE.UNSTARTED;
  }
  stop() {
    this._resetTime();
    this._state = TIMER_STATE.FINISHED;
  }
  setTime(ms) {
    this._currentTime = ms;
    this._time = ms;
  }
  tick(frameTime) {
    const elapsedTime = frameTime - this._animationStartTime;
    const remaining = this._currentTime - elapsedTime;
    if (remaining <= 0) {
      this.stop();
    } else {
      this._time = Math.round(remaining);
      this._animationId = requestAnimationFrame(this.tick.bind(this));
    }
  }
  _resetTime() {
    cancelAnimationFrame(this._animationId);
    this._time = 0;
    this._currentTime = 0;
    this._animationPausedTime = 0;
  }
  get time() {
    return this._time;
  }
  get state() {
    return this._state;
  }
  get isEnabled() {
    return this._settings.value.isEnabled;
  }
  set isEnabled(value) {
    this._settings.value.isEnabled = value;
  }
  get pricePerSecond() {
    return this._settings.value.pricePerSecond;
  }
  set pricePerSecond(value) {
    this._settings.value.pricePerSecond = value;
  }
  get onStateFinishedAction() {
    return this._settings.value.onStateFinishedAction;
  }
  set onStateFinishedAction(value) {
    this._settings.value.onStateFinishedAction = value;
  }
}
class TwitchChatSocket {
  _state = SOCKET_STATE.NOT_EXISTS;
  _socket;
  onMessage = null;
  connect(channelId) {
    this._state = SOCKET_STATE.CONNECTING;
    this._socket = new tmi.Client({ channels: [channelId] });
    this._socket.on("connected", () => this._state = SOCKET_STATE.OPEN);
    this._socket.on("message", (channel, tags, message) => {
      this.onMessage?.(channel, tags, message);
    });
    this._socket.on("disconnected", () => this._state = SOCKET_STATE.CLOSED);
    this._socket.connect();
  }
  disconnect() {
    this._socket?.disconnect();
    this._state = SOCKET_STATE.CLOSED;
  }
  get state() {
    return this._state;
  }
}
class CentrifugoSocket {
  _state = SOCKET_STATE.CLOSED;
  _socket;
  onDonation;
  async connect(user) {
    this._state = SOCKET_STATE.CONNECTING;
    this._socket = new WebSocket("wss://centrifugo.donationalerts.com/connection/websocket");
    this._socket.addEventListener("open", () => {
      this._socket?.send(JSON.stringify({
        params: { token: user.socket_connection_token },
        id: 1
      }));
    });
    this._socket.addEventListener("message", async (event) => {
      const message = JSON.parse(event.data);
      const centrifugoChannel = `$alerts:donation_${user.id}`;
      if (message.id === 1) {
        const socketToken = await fetch("/api/centrifugo/subscribe", {
          method: "POST",
          body: JSON.stringify({
            channels: [centrifugoChannel],
            client: message.result.client
          })
        }).then((res) => res.json()).then((data) => data);
        this._socket?.send(JSON.stringify({
          params: {
            channel: centrifugoChannel,
            token: socketToken
          },
          method: 1,
          id: 2
        }));
        this._state = SOCKET_STATE.OPEN;
      }
      if (!message.result.type && message.result.channel === centrifugoChannel) {
        const donation = message.result.data.data;
        this.onDonation?.(donation);
      }
    });
    this._socket.addEventListener("close", () => {
      this._state = SOCKET_STATE.CLOSED;
    });
    this._socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
      this._state = SOCKET_STATE.CLOSED;
    });
  }
  disconnect() {
    this._socket?.close();
    this._state = SOCKET_STATE.CLOSED;
  }
  get state() {
    return this._state;
  }
}
const db = new Dexie("Database");
db.version(3).stores({
  videos: null
});
db.version(2).stores({
  queueItems: "++id, videoId, title, channelTitle, donationAmount"
}).upgrade((tx) => {
  return tx.table("videos").toCollection().modify((video) => {
    const newItem = {
      videoId: video.videoId,
      title: video.title,
      channelTitle: video.channelTitle,
      thumbnail: video.thumbnail,
      submittedBy: [video.username],
      isWatched: video.isWatched,
      startSeconds: video.timing || 0,
      donationAmount: video.price,
      message: video.message
    };
    tx.table("queueItems").add(newItem);
  });
});
db.version(1).stores({
  videos: "id, videoId, title, channelTitle, thumbnail, username, isPaid, isWatched, timing, price, message"
});
class Queue {
  _settings = storable(
    {
      shouldPlayRandomly: false,
      shouldHideWatched: false
    },
    "queueSettings"
  );
  _items;
  _current = storable(null, "currentVideo");
  _previous = null;
  #sortedItems = once(this._sortItemsByDonation.bind(this));
  get sortedItems() {
    return this.#sortedItems();
  }
  #unseen = once(() => this.sortedItems?.filter((item) => !item.isWatched));
  get unseen() {
    return this.#unseen();
  }
  #count = once(() => this._items?.length);
  get count() {
    return this.#count();
  }
  #currentIndex = once(this._getCurrentIndex.bind(this));
  get currentIndex() {
    return this.#currentIndex();
  }
  constructor() {
  }
  async add(item) {
    const existingItem = this._items?.find((existing) => existing.videoId === item.videoId);
    if (existingItem) {
      await this._updateItemSubmition(existingItem, item);
    } else {
      await db.queueItems.add({ ...item, isWatched: false });
    }
  }
  async removePrevious() {
    if (this._previous) {
      await db.queueItems.delete(this._previous.id);
    }
  }
  async remove(item) {
    await db.queueItems.delete(item.id);
  }
  clear() {
    this.setCurrent(null);
    db.queueItems.clear();
  }
  next() {
    const items = this._getItemsForNext();
    if (!items) return;
    const currentIndex = items.findIndex((item) => item.id === this._current.value?.id);
    const nextItem = this._getNextItem(items, currentIndex);
    if (nextItem) {
      this.setCurrent(nextItem);
    } else {
      this.setCurrent(null);
    }
  }
  async setCurrent(item) {
    this._previous = this._current.value;
    if (this._previous) {
      await db.queueItems.update(this._previous.id, { isWatched: true });
    }
    this._current.value = item;
  }
  async _updateItemSubmition(existingItem, newItem) {
    const newUser = newItem.submittedBy[0];
    const hasUserSubmittedBefore = existingItem.submittedBy.includes(newUser);
    existingItem.donationAmount += newItem.donationAmount;
    if (!hasUserSubmittedBefore) {
      existingItem.submittedBy.push(newUser);
    }
    await db.queueItems.update(existingItem.id, {
      donationAmount: existingItem.donationAmount,
      submittedBy: existingItem.submittedBy.slice()
      // create a clone to avoid DataCloneError
    });
  }
  _getCurrentIndex() {
    const items = this.shouldHideWatched ? this.unseen : this._items;
    return items?.findIndex((item) => item.id === this._current.value?.id);
  }
  _getItemsForNext() {
    const items = this.unseen;
    if (!items || items.length <= 1) {
      this.shouldHideWatched = false;
      return this._items;
    }
    return items;
  }
  _getNextIndex(items, currentIndex) {
    let nextIndex = currentIndex + 1;
    if (this.shouldPlayRandomly) {
      do {
        nextIndex = getRandomIndex(items);
      } while (nextIndex === currentIndex && items.length > 1);
    }
    return nextIndex;
  }
  _getNextItem(items, currentIndex) {
    const nextIndex = this._getNextIndex(items, currentIndex);
    return items[nextIndex % items.length];
  }
  _sortItemsByDonation() {
    return this._items?.sort((a, b) => {
      const aDonation = a.donationAmount > 0;
      const bDonation = b.donationAmount > 0;
      if (aDonation && !bDonation) return -1;
      if (!aDonation && bDonation) return 1;
      const aSubmittedByLength = a.submittedBy.length;
      const bSubmittedByLength = b.submittedBy.length;
      if (aSubmittedByLength !== bSubmittedByLength) {
        return bSubmittedByLength - aSubmittedByLength;
      }
      return a.id - b.id;
    });
  }
  get items() {
    return this._items;
  }
  get current() {
    return this._current.value;
  }
  get previous() {
    return this._previous;
  }
  get shouldPlayRandomly() {
    return this._settings.value.shouldPlayRandomly;
  }
  set shouldPlayRandomly(val) {
    this._settings.value.shouldPlayRandomly = val;
  }
  get shouldHideWatched() {
    return this._settings.value.shouldHideWatched;
  }
  set shouldHideWatched(val) {
    this._settings.value.shouldHideWatched = val;
  }
}
class AppManager {
  queue = new Queue();
  poll = new Poll();
  timer = new Timer();
  twitchChatSocket = new TwitchChatSocket();
  centrifugoSocket = new CentrifugoSocket();
  _youtubePlayer;
  // modifying deeply nested objects will result in error
  // where the modified field is undefined.
  // so make it flat to avoid this error
  _donationSettings = storable(
    {
      requestPrice: 100,
      isSkipEnabled: false,
      isSkipDynamic: false,
      skipPrice: 100
    },
    "donationSettings"
  );
  _playerSettings = storable(
    {
      shouldAutoplay: false,
      shouldPlayNextVideo: false
    },
    "playerSettings"
  );
  // Assignment to `enabledIntegrations` property (src/routes/+page.svelte:54:51)
  // The value of `enabledIntegrations` following the assignment will evaluate to
  // the right-hand side, not the value of `enabledIntegrations` following the assignment.
  // This may result in unexpected behaviour.
  enabledIntegrations = [];
  #videoSkipPrice = once(this._getVideoSkipPrice.bind(this));
  get videoSkipPrice() {
    return this.#videoSkipPrice();
  }
  constructor() {
    this.centrifugoSocket.onDonation = this.onDonation.bind(this);
    this.twitchChatSocket.onMessage = this.onChatMessage.bind(this);
  }
  setYoutubePlayer(youtubePlayer) {
    this._youtubePlayer = youtubePlayer;
    this._youtubePlayer.on("stateChange", this._onYoutubePlayerStateChange.bind(this));
    if (this.queue.current) {
      this._youtubePlayer.cueVideoById(this.queue.current);
    }
  }
  async addVideo(username, message, donationAmount = 0) {
    const videoData = extractYoutubeVideoData(message);
    if (!videoData) return;
    const youtubeVideo = await youtubeApi.getVideo(videoData?.videoId);
    if (!youtubeVideo) throw new Error(`Youtube video with id of "${videoData.videoId}" not found`);
    this.queue.add({
      ...youtubeVideo,
      ...videoData,
      submittedBy: [username],
      message,
      donationAmount
    });
  }
  addVote(username, message) {
    const { keepKeyword, skipKeyword } = this.poll;
    const keywords = [keepKeyword, skipKeyword];
    const keyword = extractKeyword(message, keywords);
    if (!keyword) return;
    const isKeepKeyword = keyword.toLowerCase() === keepKeyword.toLowerCase();
    const isSkipKeyword = keyword.toLowerCase() === skipKeyword.toLowerCase();
    if (isKeepKeyword) this.poll.addKeep(username);
    if (isSkipKeyword) this.poll.addSkip(username);
  }
  onChatMessage(_channel, tags, message) {
    const username = tags["display-name"] || tags.username || "???";
    const canRequest = this.enabledIntegrations.includes(INTEGRATION.TWITCH);
    if (canRequest) {
      this.addVideo(username, message);
    }
    if (this.poll.isEnabled) {
      this.addVote(username, message);
    }
  }
  onDonation(donation) {
    const { isSkipEnabled, requestPrice } = this.donationSettings;
    const roundedAmount = Math.round(donation.amount_in_user_currency);
    const username = donation.username ?? "Аноним";
    const canRequest = this.enabledIntegrations.includes(INTEGRATION.DONATIONALERTS);
    if (isSkipEnabled && roundedAmount === this.videoSkipPrice) {
      this.queue.next();
    } else if (canRequest) {
      if (roundedAmount >= requestPrice) {
        this.addVideo(username, donation.message, roundedAmount);
      }
    }
  }
  _getVideoRemainingSeconds() {
    if (!this.queue.current) return;
    const { donationAmount } = this.queue.current;
    const pricePerSecond = run(() => this.timer.pricePerSecond);
    const paidSeconds = Math.round(donationAmount / pricePerSecond);
    return paidSeconds;
  }
  _getVideoSkipPrice() {
    if (!this.queue.current) return 0;
    const { skipPrice, isSkipDynamic } = this.donationSettings;
    const dynamicSkipValue = skipPrice / 100 * this.queue.current.donationAmount;
    return isSkipDynamic ? dynamicSkipValue : skipPrice;
  }
  async _loadVideo(queueItem) {
    if (!this._youtubePlayer) return;
    if (!queueItem) {
      await this._youtubePlayer.stopVideo();
      return;
    }
    const { videoId, startSeconds } = queueItem;
    const videoOptions = { videoId, startSeconds };
    const shouldAutoplay = run(() => this.playerSettings.shouldAutoplay);
    if (shouldAutoplay) {
      await this._youtubePlayer.loadVideoById(videoOptions);
    } else {
      await this._youtubePlayer.cueVideoById(videoOptions);
    }
  }
  _setRemainingSeconds() {
    if (!this.queue.current) return;
    const remainingSeconds = this._getVideoRemainingSeconds();
    const isPaidVideo = this.queue.current.donationAmount > 0;
    this.timer.reset();
    if (remainingSeconds && isPaidVideo) {
      this.timer.setTime(remainingSeconds * 1e3);
    }
  }
  _onCurrentQueueItemChange() {
    this._loadVideo(this.queue.current);
    this._setRemainingSeconds();
  }
  _onTimerStateChange() {
    const isTimerEnabled = run(() => this.timer.isEnabled);
    const action = run(() => this.timer.onStateFinishedAction);
    const isFinishedState = this.timer.state === TIMER_STATE.FINISHED;
    const haveNextVideo = this.queue.items && this.queue.items.length > 1;
    if (isTimerEnabled && isFinishedState) {
      if (action === "pause") {
        this._youtubePlayer?.pauseVideo();
      }
      if (action === "next" && haveNextVideo) {
        this.queue.next();
      } else {
        this._youtubePlayer?.pauseVideo();
      }
    }
  }
  _onEnoughPollVotes() {
    const isChatConnected = run(() => this.twitchChatSocket.state) === SOCKET_STATE.OPEN;
    const shouldAutoSkip = run(() => this.poll.shouldAutoSkip);
    const isEnoughVotes = this.poll.isEnoughVotes;
    if (isChatConnected && isEnoughVotes && shouldAutoSkip) {
      this.poll.resetCounter();
      this.queue.next();
    }
  }
  _onYoutubePlayerStateChange(event) {
    if (!this.queue.current || !this._youtubePlayer) return;
    const { data: playerState } = event;
    const isPaidVideo = this.queue.current.donationAmount > 0;
    switch (playerState) {
      case YOUTUBE_PLAYER_STATE.ENDED: {
        const shouldPlayNextVideo = this.playerSettings.shouldPlayNextVideo;
        if (shouldPlayNextVideo) this.queue.next();
        break;
      }
    }
    if (isPaidVideo && this.timer.isEnabled) {
      switch (playerState) {
        case YOUTUBE_PLAYER_STATE.PLAYING: {
          if (this.timer.time > 0) this.timer.start();
          break;
        }
        case YOUTUBE_PLAYER_STATE.PAUSED: {
          this.timer.pause();
          break;
        }
      }
    }
  }
  get donationSettings() {
    return this._donationSettings.value;
  }
  get playerSettings() {
    return this._playerSettings.value;
  }
}
const appManager = new AppManager();
function isFunction(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
const BoxSymbol = Symbol("box");
const isWritableSymbol = Symbol("is-writable");
function isBox(value) {
  return isObject(value) && BoxSymbol in value;
}
function isWritableBox(value) {
  return box.isBox(value) && isWritableSymbol in value;
}
function box(initialValue) {
  let current = initialValue;
  return {
    [BoxSymbol]: true,
    [isWritableSymbol]: true,
    get current() {
      return current;
    },
    set current(v) {
      current = v;
    }
  };
}
function boxWith(getter, setter) {
  const derived = getter();
  if (setter) {
    return {
      [BoxSymbol]: true,
      [isWritableSymbol]: true,
      get current() {
        return derived;
      },
      set current(v) {
        setter(v);
      }
    };
  }
  return {
    [BoxSymbol]: true,
    get current() {
      return getter();
    }
  };
}
function boxFrom(value) {
  if (box.isBox(value)) return value;
  if (isFunction(value)) return box.with(value);
  return box(value);
}
function boxFlatten(boxes) {
  return Object.entries(boxes).reduce(
    (acc, [key, b]) => {
      if (!box.isBox(b)) {
        return Object.assign(acc, { [key]: b });
      }
      if (box.isWritableBox(b)) {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          },
          set(v) {
            b.current = v;
          }
        });
      } else {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          }
        });
      }
      return acc;
    },
    {}
  );
}
function toReadonlyBox(b) {
  if (!box.isWritableBox(b)) return b;
  return {
    [BoxSymbol]: true,
    get current() {
      return b.current;
    }
  };
}
box.from = boxFrom;
box.with = boxWith;
box.flatten = boxFlatten;
box.readonly = toReadonlyBox;
box.isBox = isBox;
box.isWritableBox = isWritableBox;
function composeHandlers(...handlers) {
  return function(e) {
    for (const handler of handlers) {
      if (!handler)
        continue;
      if (e.defaultPrevented)
        return;
      if (typeof handler === "function") {
        handler.call(this, e);
      } else {
        handler.current?.call(this, e);
      }
    }
  };
}
const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char))
    return void 0;
  return char !== char.toLowerCase();
}
function splitByCase(str) {
  const parts = [];
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = STR_SPLITTERS.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function pascalCase(str) {
  if (!str)
    return "";
  return splitByCase(str).map((p) => upperFirst(p)).join("");
}
function camelCase(str) {
  return lowerFirst(pascalCase(str || ""));
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function cssToStyleObj(css) {
  if (!css)
    return {};
  const styleObj = {};
  function iterator(name, value) {
    if (name.startsWith("-moz-") || name.startsWith("-webkit-") || name.startsWith("-ms-") || name.startsWith("-o-")) {
      styleObj[pascalCase(name)] = value;
      return;
    }
    if (name.startsWith("--")) {
      styleObj[name] = value;
      return;
    }
    styleObj[camelCase(name)] = value;
  }
  parse(css, iterator);
  return styleObj;
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function createParser(matcher, replacer) {
  const regex = RegExp(matcher, "g");
  return (str) => {
    if (typeof str !== "string") {
      throw new TypeError(`expected an argument of type string, but got ${typeof str}`);
    }
    if (!str.match(regex))
      return str;
    return str.replace(regex, replacer);
  };
}
const camelToKebab = createParser(/[A-Z]/, (match) => `-${match.toLowerCase()}`);
function styleToCSS(styleObj) {
  if (!styleObj || typeof styleObj !== "object" || Array.isArray(styleObj)) {
    throw new TypeError(`expected an argument of type object, but got ${typeof styleObj}`);
  }
  return Object.keys(styleObj).map((property) => `${camelToKebab(property)}: ${styleObj[property]};`).join("\n");
}
function styleToString(style = {}) {
  return styleToCSS(style).replace("\n", " ");
}
const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
  transform: "translateX(-100%)"
};
styleToString(srOnlyStyles);
function isEventHandler(key) {
  return key.length > 2 && key.startsWith("on") && key[2] === key[2]?.toLowerCase();
}
function mergeProps(...args) {
  const result = { ...args[0] };
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    for (const key in props) {
      const a = result[key];
      const b = props[key];
      const aIsFunction = typeof a === "function";
      const bIsFunction = typeof b === "function";
      if (aIsFunction && typeof bIsFunction && isEventHandler(key)) {
        const aHandler = a;
        const bHandler = b;
        result[key] = composeHandlers(aHandler, bHandler);
      } else if (aIsFunction && bIsFunction) {
        result[key] = executeCallbacks(a, b);
      } else if (key === "class" && typeof a === "string" && typeof b === "string") {
        result[key] = clsx(a, b);
      } else if (key === "style") {
        const aIsObject = typeof a === "object";
        const bIsObject = typeof b === "object";
        const aIsString = typeof a === "string";
        const bIsString = typeof b === "string";
        if (aIsObject && bIsObject) {
          result[key] = { ...a, ...b };
        } else if (aIsObject && bIsString) {
          const parsedStyle = cssToStyleObj(b);
          result[key] = { ...a, ...parsedStyle };
        } else if (aIsString && bIsObject) {
          const parsedStyle = cssToStyleObj(a);
          result[key] = { ...parsedStyle, ...b };
        } else if (aIsString && bIsString) {
          const parsedStyleA = cssToStyleObj(a);
          const parsedStyleB = cssToStyleObj(b);
          result[key] = { ...parsedStyleA, ...parsedStyleB };
        } else if (aIsObject) {
          result[key] = a;
        } else if (bIsObject) {
          result[key] = b;
        }
      } else {
        result[key] = b !== void 0 ? b : a;
      }
    }
  }
  if (typeof result.style === "object") {
    result.style = styleToString(result.style).replaceAll("\n", " ");
  }
  if (result.hidden !== true) {
    result.hidden = void 0;
  }
  if (result.disabled !== true) {
    result.disabled = void 0;
  }
  return result;
}
function useRefById({
  id,
  ref,
  deps = () => true,
  onRefChange = () => {
  },
  getRootNode = () => typeof document !== "undefined" ? document : void 0
}) {
  (() => deps())();
  (() => getRootNode())();
}
function getDataOpenClosed(condition) {
  return condition ? "open" : "closed";
}
function getDataChecked(condition) {
  return condition ? "checked" : "unchecked";
}
function getAriaExpanded(condition) {
  return condition ? "true" : "false";
}
function getDataDisabled(condition) {
  return condition ? "" : void 0;
}
function getAriaRequired(condition) {
  return condition ? "true" : "false";
}
function getAriaSelected(condition) {
  return condition ? "true" : "false";
}
function getAriaChecked(checked, indeterminate) {
  return checked ? "true" : "false";
}
function getAriaOrientation(orientation) {
  return orientation;
}
function getAriaHidden(condition) {
  return condition ? "true" : void 0;
}
function getDataOrientation(orientation) {
  return orientation;
}
function getDataRequired(condition) {
  return condition ? "" : void 0;
}
function getHidden(condition) {
  return condition ? true : void 0;
}
function getDisabled(condition) {
  return condition ? true : void 0;
}
function getAriaPressed(condition) {
  return condition ? "true" : "false";
}
function getRequired(condition) {
  return condition ? true : void 0;
}
const isBrowser = typeof document !== "undefined";
function isHTMLElement(element2) {
  return element2 instanceof HTMLElement;
}
function isElement(element2) {
  return element2 instanceof Element;
}
function isFocusVisible(element2) {
  return element2.matches(":focus-visible");
}
function isNotNull(value) {
  return value !== null;
}
function isSelectableInput(element2) {
  return element2 instanceof HTMLInputElement && "select" in element2;
}
function isElementHidden(node, stopAt) {
  if (getComputedStyle(node).visibility === "hidden")
    return true;
  while (node) {
    if (stopAt !== void 0 && node === stopAt)
      return false;
    if (getComputedStyle(node).display === "none")
      return true;
    node = node.parentElement;
  }
  return false;
}
function setContext(key, value) {
  return setContext$1(key, value);
}
function getContext(key, fallback2) {
  const trueKey = typeof key === "symbol" ? key : key;
  const description = typeof key === "symbol" ? key.description : key;
  if (!hasContext(trueKey)) {
    if (fallback2 === void 0) {
      throw new Error(`Missing context dependency: ${description} and no fallback was provided.`);
    }
    return fallback2;
  }
  return getContext$1(key);
}
function getSymbolDescription(providerComponentName, contextName) {
  if (typeof providerComponentName === "string" && contextName === void 0) {
    return `${providerComponentName}Context`;
  } else if (Array.isArray(providerComponentName) && contextName === void 0) {
    return `${providerComponentName[0]}Context`;
  } else {
    return `${providerComponentName}Context`;
  }
}
function createContext(providerComponentName, contextName, useSymbol = true) {
  const symbolDescription = getSymbolDescription(providerComponentName, contextName);
  const symbol = Symbol.for(`bits-ui.${symbolDescription}`);
  const key = symbolDescription;
  function getCtx(fallback2) {
    const context = getContext(useSymbol ? symbol : key, fallback2);
    if (context === void 0) {
      throw new Error(`Context \`${symbolDescription}\` not found. Component must be used within ${Array.isArray(providerComponentName) ? `one of the following components: ${providerComponentName.join(", ")}` : `\`${providerComponentName}\``}`);
    }
    if (context === null)
      return context;
    return context;
  }
  function setCtx(value) {
    if (useSymbol) {
      return setContext(symbol, value);
    } else {
      return setContext(key, value);
    }
  }
  return [setCtx, getCtx];
}
let count = 0;
function useId(prefix = "bits") {
  count++;
  return `${prefix}-${count}`;
}
function noop() {
}
class ElementSize {
  #size = { width: 0, height: 0 };
  constructor(node, options = { box: "border-box" }) {
    this.#size = {
      width: options.initialSize?.width ?? 0,
      height: options.initialSize?.height ?? 0
    };
  }
  get width() {
    return this.#size.width;
  }
  get height() {
    return this.#size.height;
  }
}
function get(valueOrGetValue) {
  return typeof valueOrGetValue === "function" ? valueOrGetValue() : valueOrGetValue;
}
function getDPR(element2) {
  if (typeof window === "undefined") return 1;
  const win = element2.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element2, value) {
  const dpr = getDPR(element2);
  return Math.round(value * dpr) / dpr;
}
function getFloatingContentCSSVars(name) {
  return {
    [`--bits-${name}-content-transform-origin`]: `var(--bits-floating-transform-origin)`,
    [`--bits-${name}-content-available-width`]: `var(--bits-floating-available-width)`,
    [`--bits-${name}-content-available-height`]: `var(--bits-floating-available-height)`,
    [`--bits-${name}-anchor-width`]: `var(--bits-floating-anchor-width)`,
    [`--bits-${name}-anchor-height`]: `var(--bits-floating-anchor-height)`
  };
}
function useFloating(options) {
  get(options.open) ?? true;
  const middlewareOption = get(options.middleware);
  const transformOption = get(options.transform) ?? true;
  const placementOption = get(options.placement) ?? "bottom";
  const strategyOption = get(options.strategy) ?? "absolute";
  const reference = options.reference;
  let x = 0;
  let y = 0;
  const floating = box(null);
  let strategy = strategyOption;
  let placement = placementOption;
  let middlewareData = {};
  let isPositioned = false;
  const floatingStyles = (() => {
    const initialStyles = { position: strategy, left: "0", top: "0" };
    if (!floating.current) {
      return initialStyles;
    }
    const xVal = roundByDPR(floating.current, x);
    const yVal = roundByDPR(floating.current, y);
    if (transformOption) {
      return {
        ...initialStyles,
        transform: `translate(${xVal}px, ${yVal}px)`,
        ...getDPR(floating.current) >= 1.5 && { willChange: "transform" }
      };
    }
    return {
      position: strategy,
      left: `${xVal}px`,
      top: `${yVal}px`
    };
  })();
  function update() {
    if (reference.current === null || floating.current === null) return;
    computePosition(reference.current, floating.current, {
      middleware: middlewareOption,
      placement: placementOption,
      strategy: strategyOption
    }).then((position) => {
      x = position.x;
      y = position.y;
      strategy = position.strategy;
      placement = position.placement;
      middlewareData = position.middlewareData;
      isPositioned = true;
    });
  }
  return {
    floating,
    reference,
    get strategy() {
      return strategy;
    },
    get placement() {
      return placement;
    },
    get middlewareData() {
      return middlewareData;
    },
    get isPositioned() {
      return isPositioned;
    },
    get floatingStyles() {
      return floatingStyles;
    },
    get update() {
      return update;
    }
  };
}
const OPPOSITE_SIDE = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
class FloatingRootState {
  anchorNode = box(null);
  customAnchorNode = box(null);
  triggerNode = box(null);
  constructor() {
  }
}
class FloatingContentState {
  // state
  root;
  // nodes
  contentRef = box(null);
  wrapperRef = box(null);
  arrowRef = box(null);
  // ids
  arrowId = box(useId());
  id;
  wrapperId;
  style;
  #transformedStyle = once(() => {
    if (typeof this.style === "string") return cssToStyleObj(this.style);
    if (!this.style) return {};
  });
  #dir;
  #side;
  #sideOffset;
  #align;
  #alignOffset;
  #arrowPadding;
  #avoidCollisions;
  #collisionBoundary;
  #collisionPadding;
  #sticky;
  #hideWhenDetached;
  #strategy;
  #updatePositionStrategy = void 0;
  onPlaced;
  enabled;
  #arrowSize = new ElementSize(() => this.arrowRef.current ?? void 0);
  #arrowWidth = once(() => this.#arrowSize?.width ?? 0);
  #arrowHeight = once(() => this.#arrowSize?.height ?? 0);
  #desiredPlacement = once(() => this.#side?.current + (this.#align.current !== "center" ? `-${this.#align.current}` : ""));
  #boundary = once(() => Array.isArray(this.#collisionBoundary.current) ? this.#collisionBoundary.current : [this.#collisionBoundary.current]);
  #hasExplicitBoundaries = once(() => this.#boundary().length > 0);
  get hasExplicitBoundaries() {
    return this.#hasExplicitBoundaries();
  }
  #detectOverflowOptions = once(() => ({
    padding: this.#collisionPadding.current,
    boundary: this.#boundary().filter(isNotNull),
    altBoundary: this.hasExplicitBoundaries
  }));
  get detectOverflowOptions() {
    return this.#detectOverflowOptions();
  }
  #availableWidth = void 0;
  #availableHeight = void 0;
  #anchorWidth = void 0;
  #anchorHeight = void 0;
  #middleware = once(() => [
    offset({
      mainAxis: this.#sideOffset.current + this.#arrowHeight(),
      alignmentAxis: this.#alignOffset.current
    }),
    this.#avoidCollisions && shift({
      mainAxis: true,
      crossAxis: false,
      limiter: this.#sticky.current === "partial" ? limitShift() : void 0,
      ...this.detectOverflowOptions
    }),
    this.#avoidCollisions && flip({ ...this.detectOverflowOptions }),
    size({
      ...this.detectOverflowOptions,
      apply: ({ rects, availableWidth, availableHeight }) => {
        const { width: anchorWidth, height: anchorHeight } = rects.reference;
        this.#availableWidth = availableWidth;
        this.#availableHeight = availableHeight;
        this.#anchorWidth = anchorWidth;
        this.#anchorHeight = anchorHeight;
      }
    }),
    this.arrowRef.current && arrow({
      element: this.arrowRef.current,
      padding: this.#arrowPadding.current
    }),
    transformOrigin({
      arrowWidth: this.#arrowWidth(),
      arrowHeight: this.#arrowHeight()
    }),
    this.#hideWhenDetached.current && hide({
      strategy: "referenceHidden",
      ...this.detectOverflowOptions
    })
  ].filter(Boolean));
  get middleware() {
    return this.#middleware();
  }
  floating;
  #placedSide = once(() => getSideFromPlacement(this.floating.placement));
  get placedSide() {
    return this.#placedSide();
  }
  #placedAlign = once(() => getAlignFromPlacement(this.floating.placement));
  get placedAlign() {
    return this.#placedAlign();
  }
  #arrowX = once(() => this.floating.middlewareData.arrow?.x ?? 0);
  get arrowX() {
    return this.#arrowX();
  }
  #arrowY = once(() => this.floating.middlewareData.arrow?.y ?? 0);
  get arrowY() {
    return this.#arrowY();
  }
  #cannotCenterArrow = once(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
  get cannotCenterArrow() {
    return this.#cannotCenterArrow();
  }
  contentZIndex;
  #arrowBaseSide = once(() => OPPOSITE_SIDE[this.placedSide]);
  get arrowBaseSide() {
    return this.#arrowBaseSide();
  }
  #wrapperProps = once(() => ({
    id: this.wrapperId.current,
    "data-bits-floating-content-wrapper": "",
    style: {
      ...this.floating.floatingStyles,
      // keep off page when measuring
      transform: this.floating.isPositioned ? this.floating.floatingStyles.transform : "translate(0, -200%)",
      minWidth: "max-content",
      zIndex: this.contentZIndex,
      "--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
      "--bits-floating-available-width": `${this.#availableWidth}px`,
      "--bits-floating-available-height": `${this.#availableHeight}px`,
      "--bits-floating-anchor-width": `${this.#anchorWidth}px`,
      "--bits-floating-anchor-height": `${this.#anchorHeight}px`,
      // hide the content if using the hide middleware and should be hidden
      ...this.floating.middlewareData.hide?.referenceHidden && {
        visibility: "hidden",
        "pointer-events": "none"
      },
      ...this.#transformedStyle()
    },
    // Floating UI calculates logical alignment based the `dir` attribute
    dir: this.#dir.current
  }));
  get wrapperProps() {
    return this.#wrapperProps();
  }
  #props = once(() => ({
    "data-side": this.placedSide,
    "data-align": this.placedAlign,
    style: styleToString({
      ...this.#transformedStyle()
      // if the FloatingContent hasn't been placed yet (not all measurements done)
    })
  }));
  get props() {
    return this.#props();
  }
  #arrowStyle = once(() => ({
    position: "absolute",
    left: this.arrowX ? `${this.arrowX}px` : void 0,
    top: this.arrowY ? `${this.arrowY}px` : void 0,
    [this.arrowBaseSide]: 0,
    "transform-origin": {
      top: "",
      right: "0 0",
      bottom: "center 0",
      left: "100% 0"
    }[this.placedSide],
    transform: {
      top: "translateY(100%)",
      right: "translateY(50%) rotate(90deg) translateX(-50%)",
      bottom: "rotate(180deg)",
      left: "translateY(50%) rotate(-90deg) translateX(50%)"
    }[this.placedSide],
    visibility: this.cannotCenterArrow ? "hidden" : void 0
  }));
  get arrowStyle() {
    return this.#arrowStyle();
  }
  constructor(props, root) {
    this.id = props.id;
    this.#side = props.side;
    this.#sideOffset = props.sideOffset;
    this.#align = props.align;
    this.#alignOffset = props.alignOffset;
    this.#arrowPadding = props.arrowPadding;
    this.#avoidCollisions = props.avoidCollisions;
    this.#collisionBoundary = props.collisionBoundary;
    this.#collisionPadding = props.collisionPadding;
    this.#sticky = props.sticky;
    this.#hideWhenDetached = props.hideWhenDetached;
    this.#updatePositionStrategy = props.updatePositionStrategy;
    this.onPlaced = props.onPlaced;
    this.#strategy = props.strategy;
    this.#dir = props.dir;
    this.style = props.style;
    this.root = root;
    this.enabled = props.enabled;
    this.wrapperId = props.wrapperId;
    if (props.customAnchor) {
      this.root.customAnchorNode.current = props.customAnchor.current;
    }
    useRefById({
      id: this.wrapperId,
      ref: this.wrapperRef,
      deps: () => this.enabled.current
    });
    useRefById({
      id: this.id,
      ref: this.contentRef,
      deps: () => this.enabled.current
    });
    this.floating = useFloating({
      strategy: () => this.#strategy.current,
      placement: () => this.#desiredPlacement(),
      middleware: () => this.middleware,
      reference: this.root.anchorNode,
      whileElementsMounted: (...args) => {
        const cleanup = autoUpdate(...args, {
          animationFrame: this.#updatePositionStrategy?.current === "always"
        });
        return cleanup;
      },
      open: () => this.enabled.current
    });
  }
}
class FloatingAnchorState {
  ref = box(null);
  constructor(props, root) {
    if (props.virtualEl && props.virtualEl.current) {
      root.triggerNode = box.from(props.virtualEl.current);
    } else {
      useRefById({
        id: props.id,
        ref: this.ref,
        onRefChange: (node) => {
          root.triggerNode.current = node;
        }
      });
    }
  }
}
const [
  setFloatingRootContext,
  getFloatingRootContext
] = createContext("Floating.Root");
const [
  setFloatingContentContext,
  getFloatingContentContext
] = createContext("Floating.Content");
function useFloatingRootState() {
  return setFloatingRootContext(new FloatingRootState());
}
function useFloatingContentState(props) {
  return setFloatingContentContext(new FloatingContentState(props, getFloatingRootContext()));
}
function useFloatingAnchorState(props) {
  return new FloatingAnchorState(props, getFloatingRootContext());
}
function transformOrigin(options) {
  return {
    name: "transformOrigin",
    options,
    fn(data) {
      const { placement, rects, middlewareData } = data;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const isArrowHidden = cannotCenterArrow;
      const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
      const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
      const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
      const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
      let x = "";
      let y = "";
      if (placedSide === "bottom") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${-arrowHeight}px`;
      } else if (placedSide === "top") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${rects.floating.height + arrowHeight}px`;
      } else if (placedSide === "right") {
        x = `${-arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      } else if (placedSide === "left") {
        x = `${rects.floating.width + arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      }
      return { data: { x, y } };
    }
  };
}
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
function getSideFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[0];
}
function getAlignFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[1];
}
function Floating_layer($$payload, $$props) {
  push();
  let { children } = $$props;
  useFloatingRootState();
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
function Floating_layer_anchor($$payload, $$props) {
  push();
  let { id, children, virtualEl } = $$props;
  useFloatingAnchorState({
    id: box.with(() => id),
    virtualEl: box.with(() => virtualEl)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
function useTimeoutFn(cb, interval, options = {}) {
  const { immediate = true } = options;
  const isPending = box(false);
  let timer;
  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function stop() {
    isPending.current = false;
    clear();
  }
  function start(...args) {
    clear();
    isPending.current = true;
    timer = setTimeout(
      () => {
        isPending.current = false;
        timer = null;
        cb(...args);
      },
      interval
    );
  }
  if (immediate) {
    isPending.current = true;
    if (isBrowser) start();
  }
  return {
    isPending: box.readonly(isPending),
    start,
    stop
  };
}
const CONTENT_ATTR = "data-tooltip-content";
const TRIGGER_ATTR = "data-tooltip-trigger";
class TooltipProviderState {
  delayDuration;
  disableHoverableContent;
  disableCloseOnTriggerClick;
  disabled;
  ignoreNonKeyboardFocus;
  skipDelayDuration;
  isOpenDelayed = true;
  isPointerInTransit = box(false);
  #timerFn;
  constructor(props) {
    this.delayDuration = props.delayDuration;
    this.disableHoverableContent = props.disableHoverableContent;
    this.disableCloseOnTriggerClick = props.disableCloseOnTriggerClick;
    this.disabled = props.disabled;
    this.ignoreNonKeyboardFocus = props.ignoreNonKeyboardFocus;
    this.skipDelayDuration = props.skipDelayDuration;
    this.#timerFn = useTimeoutFn(
      () => {
        this.isOpenDelayed = true;
      },
      this.skipDelayDuration.current,
      { immediate: false }
    );
  }
  #startTimer = () => {
    this.#timerFn.start();
  };
  #clearTimer = () => {
    this.#timerFn.stop();
  };
  onOpen = () => {
    this.#clearTimer();
    this.isOpenDelayed = false;
  };
  onClose = () => {
    this.#startTimer();
  };
}
class TooltipRootState {
  open;
  _delayDuration;
  _disableHoverableContent;
  _disableCloseOnTriggerClick;
  _disabled;
  _ignoreNonKeyboardFocus;
  provider;
  #delayDuration = once(() => this._delayDuration.current ?? this.provider.delayDuration.current);
  get delayDuration() {
    return this.#delayDuration();
  }
  #disableHoverableContent = once(() => this._disableHoverableContent.current ?? this.provider.disableHoverableContent.current);
  get disableHoverableContent() {
    return this.#disableHoverableContent();
  }
  #disableCloseOnTriggerClick = once(() => this._disableCloseOnTriggerClick.current ?? this.provider.disableCloseOnTriggerClick.current);
  get disableCloseOnTriggerClick() {
    return this.#disableCloseOnTriggerClick();
  }
  #disabled = once(() => this._disabled.current ?? this.provider.disabled.current);
  get disabled() {
    return this.#disabled();
  }
  #ignoreNonKeyboardFocus = once(() => this._ignoreNonKeyboardFocus.current ?? this.provider.ignoreNonKeyboardFocus.current);
  get ignoreNonKeyboardFocus() {
    return this.#ignoreNonKeyboardFocus();
  }
  contentNode = null;
  triggerNode = null;
  #wasOpenDelayed = false;
  #timerFn;
  #stateAttr = once(() => {
    if (!this.open.current) return "closed";
    return this.#wasOpenDelayed ? "delayed-open" : "instant-open";
  });
  get stateAttr() {
    return this.#stateAttr();
  }
  constructor(props, provider) {
    this.provider = provider;
    this.open = props.open;
    this._delayDuration = props.delayDuration;
    this._disableHoverableContent = props.disableHoverableContent;
    this._disableCloseOnTriggerClick = props.disableCloseOnTriggerClick;
    this._disabled = props.disabled;
    this._ignoreNonKeyboardFocus = props.ignoreNonKeyboardFocus;
    this.#timerFn = useTimeoutFn(
      () => {
        this.#wasOpenDelayed = true;
        this.open.current = true;
      },
      this.delayDuration ?? 0,
      { immediate: false }
    );
  }
  handleOpen = () => {
    this.#timerFn.stop();
    this.#wasOpenDelayed = false;
    this.open.current = true;
  };
  handleClose = () => {
    this.#timerFn.stop();
    this.open.current = false;
  };
  #handleDelayedOpen = () => {
    this.#timerFn.start();
  };
  onTriggerEnter = () => {
    this.#handleDelayedOpen();
  };
  onTriggerLeave = () => {
    if (this.disableHoverableContent) {
      this.handleClose();
    } else {
      this.#timerFn.stop();
    }
  };
}
class TooltipTriggerState {
  #id;
  #ref;
  #root;
  #isPointerDown = box(false);
  #hasPointerMoveOpened = false;
  #disabled;
  #isDisabled = once(() => this.#disabled.current || this.#root.disabled);
  constructor(props, root) {
    this.#id = props.id;
    this.#ref = props.ref;
    this.#disabled = props.disabled;
    this.#root = root;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.#root.triggerNode = node;
      }
    });
  }
  handlePointerUp = () => {
    this.#isPointerDown.current = false;
  };
  #onpointerup = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = false;
  };
  #onpointerdown = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = true;
    document.addEventListener(
      "pointerup",
      () => {
        this.handlePointerUp();
      },
      { once: true }
    );
  };
  #onpointermove = (e) => {
    if (this.#isDisabled()) return;
    if (e.pointerType === "touch") return;
    if (this.#hasPointerMoveOpened || this.#root.provider.isPointerInTransit.current) return;
    this.#root.onTriggerEnter();
    this.#hasPointerMoveOpened = true;
  };
  #onpointerleave = () => {
    if (this.#isDisabled()) return;
    this.#root.onTriggerLeave();
    this.#hasPointerMoveOpened = false;
  };
  #onfocus = (e) => {
    if (this.#isPointerDown.current || this.#isDisabled()) return;
    if (this.#root.ignoreNonKeyboardFocus && !isFocusVisible(e.currentTarget)) return;
    this.#root.handleOpen();
  };
  #onblur = () => {
    if (this.#isDisabled()) return;
    this.#root.handleClose();
  };
  #onclick = () => {
    if (this.#root.disableCloseOnTriggerClick || this.#isDisabled()) return;
    this.#root.handleClose();
  };
  #props = once(() => ({
    id: this.#id.current,
    "aria-describedby": this.#root.open.current ? this.#root.contentNode?.id : void 0,
    "data-state": this.#root.stateAttr,
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "data-delay-duration": `${this.#root.delayDuration}`,
    [TRIGGER_ATTR]: "",
    tabindex: this.#isDisabled() ? void 0 : 0,
    disabled: this.#disabled.current,
    onpointerup: this.#onpointerup,
    onpointerdown: this.#onpointerdown,
    onpointermove: this.#onpointermove,
    onpointerleave: this.#onpointerleave,
    onfocus: this.#onfocus,
    onblur: this.#onblur,
    onclick: this.#onclick
  }));
  get props() {
    return this.#props();
  }
}
class TooltipContentState {
  root;
  #id;
  #ref;
  constructor(props, root) {
    this.root = root;
    this.#id = props.id;
    this.#ref = props.ref;
    useRefById({
      id: this.#id,
      ref: this.#ref,
      onRefChange: (node) => {
        this.root.contentNode = node;
      },
      deps: () => this.root.open.current
    });
  }
  #snippetProps = once(() => ({ open: this.root.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.#id.current,
    "data-state": this.root.stateAttr,
    "data-disabled": getDataDisabled(this.root.disabled),
    style: { pointerEvents: "auto", outline: "none" },
    [CONTENT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
const [
  setTooltipProviderContext,
  getTooltipProviderContext
] = createContext("Tooltip.Provider");
const [setTooltipRootContext, getTooltipRootContext] = createContext("Tooltip.Root");
function useTooltipProvider(props) {
  return setTooltipProviderContext(new TooltipProviderState(props));
}
function useTooltipRoot(props) {
  return setTooltipRootContext(new TooltipRootState(props, getTooltipProviderContext()));
}
function useTooltipTrigger(props) {
  return new TooltipTriggerState(props, getTooltipRootContext());
}
function useTooltipContent(props) {
  return new TooltipContentState(props, getTooltipRootContext());
}
function Tooltip($$payload, $$props) {
  push();
  let {
    open = false,
    onOpenChange = noop,
    disabled,
    delayDuration,
    disableCloseOnTriggerClick,
    disableHoverableContent,
    ignoreNonKeyboardFocus,
    controlledOpen = false,
    children
  } = $$props;
  useTooltipRoot({
    open: box.with(() => open, (v) => {
      if (controlledOpen) {
        onOpenChange(v);
      } else {
        open = v;
        onOpenChange(v);
      }
    }),
    delayDuration: box.with(() => delayDuration),
    disableCloseOnTriggerClick: box.with(() => disableCloseOnTriggerClick),
    disableHoverableContent: box.with(() => disableHoverableContent),
    ignoreNonKeyboardFocus: box.with(() => ignoreNonKeyboardFocus),
    disabled: box.with(() => disabled)
  });
  Floating_layer($$payload, {
    children: ($$payload2) => {
      children?.($$payload2);
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  bind_props($$props, { open });
  pop();
}
function Tooltip_trigger($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    disabled = false,
    type = "button",
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = useTooltipTrigger({
    id: box.with(() => id),
    disabled: box.with(() => disabled ?? false),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  Floating_layer_anchor($$payload, {
    id,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: mergedProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<button${spread_attributes({ ...mergedProps })}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></button>`;
      }
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  bind_props($$props, { ref });
  pop();
}
function Tooltip_provider($$payload, $$props) {
  push();
  let {
    children,
    delayDuration = 700,
    disableCloseOnTriggerClick = false,
    disableHoverableContent = false,
    disabled = false,
    ignoreNonKeyboardFocus = false,
    skipDelayDuration = 300
  } = $$props;
  useTooltipProvider({
    delayDuration: box.with(() => delayDuration),
    disableCloseOnTriggerClick: box.with(() => disableCloseOnTriggerClick),
    disableHoverableContent: box.with(() => disableHoverableContent),
    disabled: box.with(() => disabled),
    ignoreNonKeyboardFocus: box.with(() => ignoreNonKeyboardFocus),
    skipDelayDuration: box.with(() => skipDelayDuration)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
const Root = Tooltip;
const Trigger = Tooltip_trigger;
const Provider = Tooltip_provider;
/**
 * @license lucide-svelte v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  push();
  let name = fallback($$props["name"], void 0);
  let color = fallback($$props["color"], "currentColor");
  let size2 = fallback($$props["size"], 24);
  let strokeWidth = fallback($$props["strokeWidth"], 2);
  let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
  let iconNode = fallback($$props["iconNode"], () => [], true);
  const mergeClasses = (...classes) => classes.filter((className, index, array) => {
    return Boolean(className) && array.indexOf(className) === index;
  }).join(" ");
  const each_array = ensure_array_like(iconNode);
  $$payload.out += `<svg${spread_attributes(
    {
      ...defaultAttributes,
      ...$$restProps,
      width: size2,
      height: size2,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size2) : strokeWidth,
      class: mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class)
    },
    void 0,
    void 0,
    3
  )}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [tag, attrs] = each_array[$$index];
    element($$payload, tag, () => {
      $$payload.out += `${spread_attributes({ ...attrs }, void 0, void 0, 3)}`;
    });
  }
  $$payload.out += `<!--]--><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></svg>`;
  bind_props($$props, {
    name,
    color,
    size: size2,
    strokeWidth,
    absoluteStrokeWidth,
    iconNode
  });
  pop();
}
const buttonVariants = tv({
  base: "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground border",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-accent-foreground underline-offset-4 hover:underline"
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Button($$payload, $$props) {
  push();
  let {
    class: className,
    variant = "default",
    size: size2 = "default",
    ref = null,
    href = void 0,
    type = "button",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (href) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<a${spread_attributes({
      class: cn(buttonVariants({ variant, size: size2, className })),
      href,
      ...restProps
    })}>`;
    children?.($$payload);
    $$payload.out += `<!----></a>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({
      class: cn(buttonVariants({ variant, size: size2, className })),
      type,
      ...restProps
    })}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
export {
  Floating_layer_anchor as A,
  getDataChecked as B,
  getDataRequired as C,
  getAriaChecked as D,
  getAriaRequired as E,
  Floating_layer as F,
  getAriaSelected as G,
  getHidden as H,
  Icon as I,
  getAriaPressed as J,
  useTooltipContent as K,
  getFloatingContentCSSVars as L,
  remToPx as M,
  msToHHMMSS as N,
  buttonVariants as O,
  Provider as P,
  Button as Q,
  Root as R,
  INTEGRATION as S,
  Trigger as T,
  SOCKET_STATE as U,
  useId as a,
  box as b,
  cn as c,
  appManager as d,
  createContext as e,
  getAriaExpanded as f,
  getDataOpenClosed as g,
  executeCallbacks as h,
  isBrowser as i,
  isElement as j,
  isSelectableInput as k,
  isElementHidden as l,
  mergeProps as m,
  noop as n,
  composeHandlers as o,
  isHTMLElement as p,
  getDataDisabled as q,
  getDisabled as r,
  getRequired as s,
  styleToString as t,
  useRefById as u,
  srOnlyStyles as v,
  getAriaHidden as w,
  useFloatingContentState as x,
  getAriaOrientation as y,
  getDataOrientation as z
};
