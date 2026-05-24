import type { SocketMessage } from "$lib/types";
import QueueStore from "./QueueManager.svelte";
import PollStore from "./PollStore.svelte";
import { browser } from "$app/environment";
import { toast } from "svelte-sonner";
import YouTubePlayerStore from "./YoutubePlayerStore.svelte";
import { PersistedState } from "runed";
import TimerStore from "./TimerStore.svelte";
import IntegrationManager from "./integrations/IntegrationManager.svelte";
import NumberFormatter from "$lib/utils/NumberFormatter";
import YoutubeApi from "$lib/api/youtubeApi";
import DonationAlertsApi from "$lib/api/donationalertsApi";
import DonatePayApi from "$lib/api/donatePayApi";
import RandomColorStore from "./RandomColorStore";

type SkipAction = 'none' | 'warning' | 'skip';

type PersistedAppState = {
	shouldLoop: boolean;
	paidTimerPricePerMinute: number;
	prioritizedVideoPrice: number;
	paidTimerEnabled: boolean;
	autoSkipAction: SkipAction;
}

class G {
	readonly youtubeApi = new YoutubeApi();
	readonly donationalertsApi = new DonationAlertsApi();
	readonly donatepayApi = new DonatePayApi();
	readonly youtubePlayer = new YouTubePlayerStore();
	readonly randomColor = new RandomColorStore();
	readonly queueManager = new QueueStore(this.randomColor, this.youtubeApi);
	readonly poll = new PollStore();
	readonly autoSkipTimer = new TimerStore();
	readonly paidTimer = new TimerStore('up');
	readonly integrations: IntegrationManager;

	private _isLoadingItems = $state(true);
	private _isDonatePayApiKeyDialogOpen = $state(false);

	readonly canVote = $derived(this.poll.isEnabled && this.queueManager.current);

	private _persisted = new PersistedState<PersistedAppState>('appStore', {
		shouldLoop: false,
		paidTimerEnabled: false,
		paidTimerPricePerMinute: 100,
		prioritizedVideoPrice: 100,
		autoSkipAction: 'warning',
	});

	private _videoRequestPrefix = '!rq';

	constructor() {
		this._initialize();

		this.integrations = new IntegrationManager(this.onSocketMessage.bind(this));
	}

	get autoSkipAction() { return this._persisted.current.autoSkipAction; }
	set autoSkipAction(val: SkipAction) { this._persisted.current.autoSkipAction = val; }
	get shouldLoop() { return this._persisted.current.shouldLoop; }
	set shouldLoop(val: boolean) { this._persisted.current.shouldLoop = val; }
	get paidTimerEnabled() { return this._persisted.current.paidTimerEnabled; }
	set paidTimerEnabled(val: boolean) { this._persisted.current.paidTimerEnabled = val; }
	get paidTimerPricePerMinute() { return this._persisted.current.paidTimerPricePerMinute; }
	set paidTimerPricePerMinute(val: number) { this._persisted.current.paidTimerPricePerMinute = val; }
	get prioritizedVideoPrice() { return this._persisted.current.prioritizedVideoPrice }
	set prioritizedVideoPrice(val: number) { this._persisted.current.prioritizedVideoPrice = val; }
	get isDonatePayApiKeyDialogOpen() { return this._isDonatePayApiKeyDialogOpen; }
	get isLoadingItems() { return this._isLoadingItems; }

	public onSocketMessage(message: SocketMessage) {
		const isPaid = message.value > 0;

		// for paid messaged
		if (isPaid) {
			this._processDonationMessage(message);

			return;
		}

		this._processChatMessage(message);
	}

	public resetVotes(isManual = false) {
		this.poll.reset(isManual);
		this.autoSkipTimer.reset();
	}

	public resumeVideo() {
		this.autoSkipTimer.reset();
		this.youtubePlayer.play();
	}

	private _processChatMessage({ name, message, value }: SocketMessage) {
		const hasPrefix = message.startsWith(this._videoRequestPrefix);
		const messageWithoutPrefix = message.replace(this._videoRequestPrefix, '').trim();

		if (hasPrefix && messageWithoutPrefix && !this.queueManager.isFull) {
			this.queueManager.addVideo(name, messageWithoutPrefix, value);
		}

		if (this.canVote) {
			this.poll.addVote(name, message);
		}
	}

	private _processDonationMessage({ name, message, value }: SocketMessage) {
		if (!this.queueManager.isFull) {
			this.queueManager.addVideo(name, message, value);
		} else {
			toast.warning('Видео не было добавлено', { description: 'Очередь заполнена!' })
		}
	}

	private _activateAutoSkipAction() {
		if (this.autoSkipTimer.isRunning || this.autoSkipAction === 'none') return;

		if (this.autoSkipAction === 'skip') {
			this.queueManager.next();
			this.poll.reset();

			return;
		}

		if (this.autoSkipAction === 'warning') {
			this.youtubePlayer.pause();
			this.autoSkipTimer.start(7000);

			return;
		}
	}

	private _onAutoSkipTimerFinished() {
		this.autoSkipTimer.reset();
		this.queueManager.next();
	}

	private _onVideoUnstarted() {
		this.poll.reset();
		this.paidTimer.reset();
		this.autoSkipTimer.reset();

		if (!this.paidTimerEnabled) return;

		const currentVideo = this.queueManager.current;
		if (!currentVideo || currentVideo.value <= 0) return;

		const paidMinutes = currentVideo.value / this.paidTimerPricePerMinute;
		let duration = paidMinutes * 60 * 1000;

		if (currentVideo.duration) {
			const originalDuration = NumberFormatter.timeStringToMs(currentVideo.duration);
			duration = Math.min(originalDuration, duration);
		}

		this.paidTimer.setTime(duration);
	}

	private _onVideoEnded() {
		if (!this.shouldLoop) this.queueManager.next();
	}

	private _onVideoPause() {
		if (!this.queueManager.current) return;

		const currentIsPaid = this.queueManager.current.value > 0;

		if (this.paidTimerEnabled && currentIsPaid) {
			this.paidTimer.pause();
		}
	}

	private _onVideoPlay() {
		if (!this.queueManager.current) return;

		const currentIsPaid = this.queueManager.current.value > 0;

		if (this.paidTimerEnabled && currentIsPaid) {
			this.paidTimer.start();
		}
	}

	private async _initialize() {
		if (browser) {
			this._isLoadingItems = true;
			await this.queueManager.initialize();
			this._isLoadingItems = false;

			this.youtubePlayer.on('unstarted', this._onVideoUnstarted.bind(this));
			this.youtubePlayer.on('play', this._onVideoPlay.bind(this));
			this.youtubePlayer.on('pause', this._onVideoPause.bind(this));
			this.youtubePlayer.on('ended', this._onVideoEnded.bind(this));

			this.autoSkipTimer.on('finished', this._onAutoSkipTimerFinished.bind(this));
			this.paidTimer.on('finished', this._activateAutoSkipAction.bind(this));
			this.poll.on('finished', this._activateAutoSkipAction.bind(this));
		}
	}
}

const appStore = new G();
export default appStore;
