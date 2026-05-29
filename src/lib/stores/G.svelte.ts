import type { RawQueueItemData, SocketMessageData } from "$lib/types";
import QueueStore from "./QueueManager.svelte";
import PollStore from "./PollStore.svelte";
import { browser, dev } from "$app/environment";
import YouTubePlayerStore from "./YoutubePlayerStore.svelte";
import TimerStore from "./TimerStore.svelte";
import YoutubeApiClient from "$lib/api/YoutubeApiClient";
import DonationAlertsApiClient from "$lib/api/DonationAlertsApiClient";
import DonatePayApiClient from "$lib/api/DonatePayApiClient";
import { AVAILABLE_PROVIDERS } from "$lib/providers";
import SettingsStore from "./SettingsStore.svelte";
import { REQUEST_PREFIX } from "$lib/constants";
import IntegrationManager from "./IntegrationManager.svelte";
import Integration from "./Integration.svelte";
import TwitchApiClient from "$lib/api/TwitchApiClient";
import KickApiClient from "$lib/api/KickApiClient";
import { extractYoutubeVideoData, formatYoutubeDurationToMs, randInt } from "$lib/utils";
import { page } from "$app/state";
import type { VideoData } from "$lib/api/types";
import RandomColorStore from "./RandomColorStore";
import TurnirApiClient from "$lib/api/TurnirApiClient";

type QueueItemParams = {
	fetchedData: VideoData;
	extractedData: {
		videoId: string;
		startSeconds: number;
	};
	username: string;
	message: string;
	value: number;
}

const turnirApiOrigin = 'https://mapcar.alwaysdata.net/v2/turnir-api';

class G {
	static readonly settings = new SettingsStore();
	static readonly randomColor = new RandomColorStore();

	static readonly turnirApi = new TurnirApiClient(turnirApiOrigin);
	static readonly youtubeApi = new YoutubeApiClient();
	static readonly twitchApi = new TwitchApiClient();
	static readonly kickApi = new KickApiClient();
	static readonly donationalertsApi = new DonationAlertsApiClient();
	static readonly donatepayApi = new DonatePayApiClient();

	static readonly autoSkipTimer = new TimerStore();
	static readonly voteBlockTimer = new TimerStore();

	static readonly youtubePlayer = new YouTubePlayerStore();
	static readonly integrationManager = new IntegrationManager();
	static readonly queueManager = new QueueStore(this.settings);
	static readonly poll = new PollStore(this.settings);

	private static _simulationIntervalId?: number;
	private static _validationIntervalId?: number;
	private static _isEventTriggered = false;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	private static _submittedByUser = new Map<string, number>();

	public static async initialize() {
		if (browser) {
			this._validateTwitchTokenHourly();
			this._connectEvents();
			this._registerIntegrations();
		}
	}

	public static dispose() {
		this.integrationManager.disconnectAll();

		clearInterval(this._simulationIntervalId);
		clearInterval(this._validationIntervalId);
	}

	private static _onSocketMessage(message: SocketMessageData) {
		if (this.queueManager.isFull) return;
		if (dev) console.log(`[MESSAGE]: ${message.message}`);

		const isPaid = message.value > 0;

		if (isPaid && message.value >= this.settings.paidVideoPrice) {
			this._processDonationMessage(message);
			return;
		}

		this._processChatMessage(message);
	}

	private static async _processDonationMessage(message: SocketMessageData) {
		const newItem = await this._fetchNewQueueItem(message);
		if (!newItem) return;

		this.queueManager.enqueue(newItem);
	}

	private static async _processChatMessage({ name, message, value, source }: SocketMessageData) {
		const hasPrefix = message.startsWith(REQUEST_PREFIX);
		const messageWithoutPrefix = message.replace(REQUEST_PREFIX, '').trim();
		const submittedAmount = this._submittedByUser.get(name) || 0;
		const canRequest = this.settings.maxRequestsPerUser === null || submittedAmount < this.settings.maxRequestsPerUser;

		if (hasPrefix && messageWithoutPrefix && canRequest) {
			const newItem = await this._fetchNewQueueItem({
				name,
				message: messageWithoutPrefix,
				value,
				source
			});

			if (newItem) {
				this.queueManager.enqueue(newItem);
				this._submittedByUser.set(name, submittedAmount + 1);
			}
		}

		if (this.settings.isPollEnabled && this.queueManager.current) {
			this.poll.addVote(name, message);
		}
	}

	private static async _fetchNewQueueItem({ name, message, value }: SocketMessageData) {
		const extractedData = extractYoutubeVideoData(message);
		if (!extractedData) {
			if (dev) {
				console.warn(`[VIDEO FETCH]: No data found in message: "${message}"`);
			}

			return;
		}

		// const existingItem = this.queueManager.isDuplicate(extractedData.videoId);
		// if (existingItem && value < 1) {
		// 	if (dev) {
		// 		console.log(`[VIDEO FETCH]: Already in queue: "${existingItem.title}"`);
		// 	}

		// 	return;
		// };

		const fetchedData = await this.youtubeApi.getVideo(extractedData.videoId);
		if (!fetchedData) return;

		return this._composeQueueItem({
			fetchedData,
			extractedData,
			username: name,
			message,
			value,
		});
	}

	private static _activateAutoSkipAction() {
		if (this.autoSkipTimer.isRunning || this.settings.autoSkipAction === 'none') return;

		if (this.settings.autoSkipAction === 'skip') {
			this.queueManager.next();
			this.poll.reset();

			return;
		}

		if (this.settings.autoSkipAction === 'warning') {
			this.youtubePlayer.pause();
			this.autoSkipTimer.start(7000);

			return;
		}
	}

	private static _onAutoSkipTimerFinished() {
		this.autoSkipTimer.reset();
		this.queueManager.next();
	}

	private static _onVideoUnstarted() {
		this.autoSkipTimer.reset();
		this.poll.reset();

		this._isEventTriggered = false;
	}

	private static _onVideoEnded() {
		if (!this.settings.shouldLoop) this.queueManager.next();
	}

	private static _onVideoPlay() {
		this.autoSkipTimer.reset();
	}

	private static async _onVideoTimeUpdate({ current }: { current: number, duration: number }) {
		const isPaid = this.queueManager.current?.value > 0;
		const isSettingEnabled = this.settings.isPaidTimeEnabled;
		const isLive = this.queueManager.current?.isLive;

		if (this._isEventTriggered || isLive || !isSettingEnabled || !isPaid) return;

		const startMs = this.queueManager.current.startMs;
		const paidMs = this.queueManager.currentPaidMs;

		if (current * 1000 >= startMs + paidMs) {
			this._activateAutoSkipAction();
			this._isEventTriggered = true;
		}
	}

	private static async _validateTwitchTokenHourly() {
		if (!page.data.accounts?.some((acc) => acc.providerId === 'twitch')) return;

		// const data = await this.twitchApi.validateToken();
		// if (!data) return;

		this._validationIntervalId = window.setInterval(async () => {
			const data = await this.twitchApi.validateToken();
			if (data) return;

			clearInterval(this._validationIntervalId);
		}, 59 * 60 * 1000); // 59 minutes
	}

	private static _registerIntegrations() {
		for (const data of AVAILABLE_PROVIDERS) {
			const integration = new Integration(data);

			integration.on('message', this._onSocketMessage.bind(this));
			this.integrationManager.add(integration);
		}
	}

	private static _connectEvents() {
		this.youtubePlayer.on('unstarted', this._onVideoUnstarted.bind(this));
		this.youtubePlayer.on('ended', this._onVideoEnded.bind(this));
		this.youtubePlayer.on('play', this._onVideoPlay.bind(this));
		this.youtubePlayer.on('timeupdated', this._onVideoTimeUpdate.bind(this));

		this.autoSkipTimer.on('finished', this._onAutoSkipTimerFinished.bind(this));
		this.poll.on('finished', this._activateAutoSkipAction.bind(this));
	}

	private static _composeQueueItem(params: QueueItemParams): RawQueueItemData {
		const color = this.randomColor.get().array() as [number, number, number];
		const isLive = params.fetchedData.snippet.liveBroadcastContent === 'live';
		const duration = params.fetchedData.contentDetails.duration;

		return {
			channelTitle: params.fetchedData.snippet.channelTitle,
			title: params.fetchedData.snippet.title,
			thumbnail: params.fetchedData.snippet.thumbnails.medium.url,
			durationMs: duration ? formatYoutubeDurationToMs(duration) : undefined,
			videoId: params.extractedData.videoId,
			viewCount: params.fetchedData.statistics.viewCount,
			publishedAt: params.fetchedData.snippet.publishedAt,
			isLive,
			startMs: params.extractedData.startSeconds * 1000,
			value: params.value,
			submittedBy: params.username,
			color,
		}
	}

	public static __sendDevMessage(message: string, value = 0) {
		this._onSocketMessage({ name: 'dev', message, source: 'twitch', value });
	}

	public static __toggleVotingSimulation(isToggled: boolean) {
		if (!isToggled) {
			window.clearInterval(this._simulationIntervalId);
			return;
		}

		this._simulationIntervalId = window.setInterval(() => {
			// const message = G.poll.skipKeyword;
			const message = randInt(0, 2) === 0 ? G.settings.keepKeyword : G.settings.skipKeyword;
			const name = crypto.randomUUID() as string;
			this._onSocketMessage({ name, message, value: 0, source: 'twitch' });
		}, 250);
	}
}

export default G;
