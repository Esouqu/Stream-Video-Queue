import type { IDonationSocketData, IQueueItem } from "../interfaces";
import { extractKeyword, extractYoutubeVideoData } from "../utils";
import tmi from 'tmi.js';
import youtubeApi from "../api/youtubeApi";
import { INTEGRATION, SOCKET_STATE, TIMER_STATE, YOUTUBE_PLAYER_STATE } from "../enums";
import Poll from "./Poll.svelte";
import Timer from "./Timer.svelte";
import type { YouTubePlayer } from "youtube-player/dist/types";
import TwitchChatSocket from "./TwitchChatSocket.svelte";
import CentrifugoSocket from "./CentrifugoSocket.svelte";
import Queue from "./Queue.svelte";
import { storable } from "./LocalStore.svelte";
import { untrack } from "svelte";

class AppManager {
  readonly queue = new Queue();
  readonly poll = new Poll();
  readonly timer = new Timer();
  readonly twitchChatSocket = new TwitchChatSocket();
  readonly centrifugoSocket = new CentrifugoSocket();
  private _youtubePlayer: YouTubePlayer | undefined;

  // modifying deeply nested objects will result in error
  // where the modified field is undefined.
  // so make it flat to avoid this error
  private _donationSettings = storable({
    requestPrice: 100,

    isSkipEnabled: false,
    isSkipDynamic: false,
    skipPrice: 100,
  }, 'donationSettings');
  private _playerSettings = storable({
    shouldAutoplay: false,
    shouldPlayNextVideo: false,
  }, 'playerSettings');

  // Assignment to `enabledIntegrations` property (src/routes/+page.svelte:54:51)
  // The value of `enabledIntegrations` following the assignment will evaluate to
  // the right-hand side, not the value of `enabledIntegrations` following the assignment.
  // This may result in unexpected behaviour.
  public enabledIntegrations: INTEGRATION[] = $state([]);
  public videoSkipPrice = $derived.by(this._getVideoSkipPrice.bind(this));

  constructor() {
    this.centrifugoSocket.onDonation = this.onDonation.bind(this);
    this.twitchChatSocket.onMessage = this.onChatMessage.bind(this);

    $effect.root(() => {
      $effect(() => {
        // triggers when this.queue.current changed
        this._onCurrentQueueItemChange.bind(this)();
      });

      $effect(() => {
        // triggers when this.poll.isEnoughVotes changed
        this._onEnoughPollVotes.bind(this)();
      });

      $effect(() => {
        // triggers when this.timer.state changed
        this._onTimerStateChange.bind(this)();
      });
    });
  }

  public setYoutubePlayer(youtubePlayer: YouTubePlayer) {
    this._youtubePlayer = youtubePlayer;
    this._youtubePlayer.on('stateChange', this._onYoutubePlayerStateChange.bind(this));

    if (this.queue.current) {
      this._youtubePlayer.cueVideoById(this.queue.current);
    }
  }

  public async addVideo(username: string, message: string, donationAmount = 0) {
    const videoData = extractYoutubeVideoData(message);
    if (!videoData) return;

    const youtubeVideo = await youtubeApi.getVideo(videoData?.videoId);
    if (!youtubeVideo) throw new Error(`Youtube video with id of "${videoData.videoId}" not found`);

    this.queue.add({
      ...youtubeVideo,
      ...videoData,
      submittedBy: [username],
      message,
      donationAmount,
    });
  }

  public addVote(username: string, message: string) {
    const { keepKeyword, skipKeyword } = this.poll;
    const keywords = [keepKeyword, skipKeyword];
    const keyword = extractKeyword(message, keywords);

    if (!keyword) return;

    const isKeepKeyword = keyword.toLowerCase() === keepKeyword.toLowerCase();
    const isSkipKeyword = keyword.toLowerCase() === skipKeyword.toLowerCase();

    if (isKeepKeyword) this.poll.addKeep(username);
    if (isSkipKeyword) this.poll.addSkip(username);
  }

  public onChatMessage(_channel: string, tags: tmi.ChatUserstate, message: string) {
    const username = tags['display-name'] || tags.username || '???';
    const canRequest = this.enabledIntegrations.includes(INTEGRATION.TWITCH);

    if (canRequest) {
      this.addVideo(username, message);
    }

    if (this.poll.isEnabled) {
      this.addVote(username, message);
    }
  }

  public onDonation(donation: IDonationSocketData) {
    const { isSkipEnabled, requestPrice } = this.donationSettings;

    const roundedAmount = Math.round(donation.amount_in_user_currency);
    const username = donation.username ?? 'Аноним';
    const canRequest = this.enabledIntegrations.includes(INTEGRATION.DONATIONALERTS);

    if (canRequest) {
      if (isSkipEnabled && roundedAmount === this.videoSkipPrice) {
        this.queue.next();
      }

      if (roundedAmount >= requestPrice) {
        this.addVideo(username, donation.message, roundedAmount);
      }
    }
  }

  private _getVideoRemainingSeconds() {
    if (!this.queue.current) return;

    const { donationAmount } = this.queue.current;
    const pricePerSecond = untrack(() => this.timer.pricePerSecond);
    const paidSeconds = Math.round(donationAmount / pricePerSecond);

    return paidSeconds;
  }

  private _getVideoSkipPrice() {
    if (!this.queue.current) return 0;

    const { skipPrice, isSkipDynamic, requestPrice } = this.donationSettings;
    const { donationAmount } = this.queue.current;
    const dynamicSkipValue = skipPrice / 100 * donationAmount;

    return isSkipDynamic ? dynamicSkipValue < 1 ? requestPrice : dynamicSkipValue : skipPrice;
  }

  private async _loadVideo(queueItem: IQueueItem | null) {
    if (!this._youtubePlayer) return;

    if (!queueItem) {
      await this._youtubePlayer.stopVideo();
      return;
    }

    const { videoId, startSeconds } = queueItem;
    const videoOptions = { videoId, startSeconds };
    const shouldAutoplay = untrack(() => this.playerSettings.shouldAutoplay);

    if (shouldAutoplay) {
      await this._youtubePlayer.loadVideoById(videoOptions);
    } else {
      await this._youtubePlayer.cueVideoById(videoOptions);
    }
  }

  private _setRemainingSeconds() {
    if (!this.queue.current) return;

    const remainingSeconds = this._getVideoRemainingSeconds();
    const isPaidVideo = this.queue.current.donationAmount > 0;

    this.timer.reset();

    if (remainingSeconds && isPaidVideo) {
      this.timer.setTime(remainingSeconds * 1000);
    }
  }

  private _onCurrentQueueItemChange() {
    this._loadVideo(this.queue.current);
    this._setRemainingSeconds();
    this.poll.resetCounter();
  }

  private _onTimerStateChange() {
    const isTimerEnabled = untrack(() => this.timer.isEnabled);
    const action = untrack(() => this.timer.onStateFinishedAction);
    const isFinishedState = this.timer.state === TIMER_STATE.FINISHED;
    const haveNextVideo = this.queue.items && this.queue.items.length > 1;

    if (isTimerEnabled && isFinishedState) {
      if (action === 'pause') {
        this._youtubePlayer?.pauseVideo();
      }

      if (action === 'next' && haveNextVideo) {
        this.queue.next();
      } else {
        this._youtubePlayer?.pauseVideo();
      }
    }
  }

  private _onEnoughPollVotes() {
    const isChatConnected = untrack(() => this.twitchChatSocket.state) === SOCKET_STATE.OPEN;
    const shouldAutoSkip = untrack(() => this.poll.shouldAutoSkip);
    const isEnoughVotes = this.poll.isEnoughVotes;

    if (isChatConnected && isEnoughVotes && shouldAutoSkip) {
      this.queue.next();
    }
  }

  private _onYoutubePlayerStateChange(event: CustomEvent<unknown> & { data: YOUTUBE_PLAYER_STATE }) {
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

  get donationSettings() { return this._donationSettings.value; }
  get playerSettings() { return this._playerSettings.value; }
}

const appManager = new AppManager();

export default appManager;
