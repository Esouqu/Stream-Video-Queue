import type { SocketMessage } from "$lib/types";
import QueueStore from "./QueueManager.svelte";
import PollStore from "./PollStore.svelte";
import { browser } from "$app/environment";
import { toast } from "svelte-sonner";
import YouTubePlayerStore from "./YoutubePlayerStore.svelte";
import TimerStore from "./TimerStore.svelte";
import NumberFormatter from "$lib/utils/NumberFormatter";
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
import { randInt } from "$lib/utils";

class G {
	static readonly settings = new SettingsStore();

	static readonly youtubeApi = new YoutubeApiClient();
	static readonly twitchApi = new TwitchApiClient();
	static readonly kickApi = new KickApiClient();
	static readonly donationalertsApi = new DonationAlertsApiClient();
	static readonly donatepayApi = new DonatePayApiClient();

	static readonly autoSkipTimer = new TimerStore();
	static readonly voteBlockTimer = new TimerStore();
	static readonly paidTimer = new TimerStore('up');

	static readonly youtubePlayer = new YouTubePlayerStore();
	static readonly integrationManager = new IntegrationManager();
	static readonly queueManager = new QueueStore(this.youtubeApi, this.settings);
	static readonly poll = new PollStore(this.settings);

	private static _simulationIntervalId?: number;

	public static async initialize() {
		if (browser) {
			this.youtubePlayer.on('unstarted', this._onVideoUnstarted.bind(this));
			this.youtubePlayer.on('play', this._onVideoPlay.bind(this));
			this.youtubePlayer.on('pause', this._onVideoPause.bind(this));
			this.youtubePlayer.on('ended', this._onVideoEnded.bind(this));

			this.autoSkipTimer.on('finished', this._onAutoSkipTimerFinished.bind(this));
			this.paidTimer.on('finished', this._activateAutoSkipAction.bind(this));
			this.poll.on('finished', this._activateAutoSkipAction.bind(this));

			for (const data of AVAILABLE_PROVIDERS) {
				const integration = new Integration(data);

				integration.on('message', this._onSocketMessage.bind(this));
				this.integrationManager.add(integration);
			}
		}
	}

	private static _onSocketMessage(message: SocketMessage) {
		const isPaid = message.value > 0;

		console.log(`[MESSAGE]: ${message.message}`);

		if (isPaid) {
			this._processDonationMessage(message);
			return;
		}

		this._processChatMessage(message);
	}

	private static _processChatMessage({ name, message, value }: SocketMessage) {
		const hasPrefix = message.startsWith(REQUEST_PREFIX);
		const messageWithoutPrefix = message.replace(REQUEST_PREFIX, '').trim();

		if (hasPrefix && messageWithoutPrefix && !this.queueManager.isFull) {
			this.queueManager.addVideo(name, messageWithoutPrefix, value);
		}

		if (this.settings.isPollEnabled && this.queueManager.current) {
			this.poll.addVote(name, message);
		}
	}

	private static _processDonationMessage({ name, message, value }: SocketMessage) {
		if (!this.queueManager.isFull) {
			this.queueManager.addVideo(name, message, value);
		} else {
			toast.warning('Видео не было добавлено', { description: 'Очередь заполнена!' })
		}
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
		this.paidTimer.reset();
		this.poll.reset();

		if (!this.settings.isPaidTimerEnabled) return;

		const currentVideo = this.queueManager.current;
		if (!currentVideo || currentVideo.value <= 0) return;

		const paidMinutes = currentVideo.value / this.settings.paidTimerPricePerMinute;
		let duration = paidMinutes * 60 * 1000;

		if (currentVideo.duration) {
			const originalDuration = NumberFormatter.timeStringToMs(currentVideo.duration);
			duration = Math.min(originalDuration, duration);
		}

		this.paidTimer.setTime(duration);
	}

	private static _onVideoEnded() {
		if (!this.settings.shouldLoop) this.queueManager.next();
	}

	private static _onVideoPause() {
		if (!this.queueManager.current) return;

		const currentIsPaid = this.queueManager.current.value > 0;

		if (this.settings.isPaidTimerEnabled && currentIsPaid) {
			this.paidTimer.pause();
		}
	}

	private static _onVideoPlay() {
		if (!this.queueManager.current) return;

		const currentIsPaid = this.queueManager.current.value > 0;

		if (this.settings.isPaidTimerEnabled && currentIsPaid) {
			this.paidTimer.start();
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
