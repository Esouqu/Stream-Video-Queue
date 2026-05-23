import youtubeApi from "$lib/api/youtubeApi";
import dexieDB from "$lib/dexie";
import type { QueueItemData, SocketMessage } from "$lib/types";
import type { VideoData } from "$lib/api/types";
import { extractYoutubeVideoData, formatYoutubeDuration } from "$lib/utils";
import QueueStore from "./QueueStore.svelte";
import PollStore from "./PollStore.svelte";
import RandomColor from "./RandomColorStore";
import { browser } from "$app/environment";
import { toast } from "svelte-sonner";
import YouTubePlayerStore from "./YoutubePlayerStore.svelte";
import { PersistedState } from "runed";
import TimerStore from "./TimerStore.svelte";
import IntegrationManager from "./integrations/IntegrationManager.svelte";
import NumberFormatter from "$lib/utils/NumberFormatter";

type SkipAction = 'none' | 'warning' | 'skip';

type QueueItemParams = {
	videoData: VideoData;
	videoId: string;
	startSeconds: number;
	username: string;
	message: string;
	value: number;
}

type PersistedAppState = {
	shouldLoop: boolean;
	paidTimerPricePerMinute: number;
	prioritizedVideoPrice: number;
	paidTimerEnabled: boolean;
	autoSkipAction: SkipAction;
}

class G {
	readonly youtubePlayer = new YouTubePlayerStore();
	readonly queue = new QueueStore(dexieDB);
	readonly poll = new PollStore();
	readonly autoSkipTimer = new TimerStore();
	readonly paidTimer = new TimerStore('up');
	readonly integrations: IntegrationManager;

	readonly canVote = $derived(this.poll.isEnabled && this.queue.current);

	private _randomColor = new RandomColor();
	private _isLoadingItems = $state(true);
	private _isDonatePayApiKeyDialogOpen = $state(false);

	private _persisted = new PersistedState<PersistedAppState>('appStore', {
		shouldLoop: false,
		paidTimerEnabled: false,
		paidTimerPricePerMinute: 100,
		prioritizedVideoPrice: 100,
		autoSkipAction: 'warning',
	});

	private _videoRequestPrefix = '!rq';

	get autoSkipAction() {
		return this._persisted.current.autoSkipAction;
	}

	set autoSkipAction(val: SkipAction) {
		this._persisted.current.autoSkipAction = val;
	}

	get shouldLoop() {
		return this._persisted.current.shouldLoop;
	}

	set shouldLoop(val: boolean) {
		this._persisted.current.shouldLoop = val;
	}

	get paidTimerEnabled() {
		return this._persisted.current.paidTimerEnabled;
	}
	set paidTimerEnabled(val: boolean) {
		this._persisted.current.paidTimerEnabled = val;
	}

	get paidTimerPricePerMinute() {
		return this._persisted.current.paidTimerPricePerMinute;
	}
	set paidTimerPricePerMinute(val: number) {
		this._persisted.current.paidTimerPricePerMinute = val;
	}

	get prioritizedVideoPrice() {
		return this._persisted.current.prioritizedVideoPrice
	}
	set prioritizedVideoPrice(val: number) {
		this._persisted.current.prioritizedVideoPrice = val;
	}

	get isDonatePayApiKeyDialogOpen() {
		return this._isDonatePayApiKeyDialogOpen;
	}

	get isLoadingItems() {
		return this._isLoadingItems;
	}

	constructor() {
		this._initialize();

		this.integrations = new IntegrationManager(this.onSocketMessage.bind(this));
	}

	public async clearQueue() {
		try {
			await this.queue.clear();
			toast.message("Очередь очищена");
		} catch (err) {
			toast.error('Не очистить очередь', { description: (err as Error).message });
		}
	}

	public async removeVideo(video: QueueItemData) {
		try {
			await this.queue.dequeue(video);
			toast.message("Видео удалено из очереди", {
				description: video.title,
			});
		} catch (err) {
			toast.error('Не удалось удалить видео', { description: (err as Error).message });
		}
	}

	public async addVideo(username: string, message: string, value: number) {
		const data = extractYoutubeVideoData(message);
		if (!data) {
			console.warn(`No video data found in message: "${message}"`);
			return;
		};

		const existingItem = await this.queue.getItemByVideoId(data.videoId);
		if (existingItem && value === 0) return;

		try {
			const videoData = await youtubeApi.getVideo(data.videoId);
			const newItem = this._composeQueueItem({
				videoData,
				username,
				message,
				value,
				...data
			});

			await this.queue.enqueue(newItem);

			toast.message("Видео добавлено", {
				description: videoData.snippet.title,
			});
		} catch (err) {
			toast.error('Не удалось добавить видео', {
				description: (err as Error).message
			});
		}
	}

	public onSocketMessage({ name, message, value }: SocketMessage) {
		const isQueueFull = this.queue.isFull;
		const isPaid = value > 0;

		// for paid messaged
		if (isPaid) {
			// we dont need prefix and can't vote
			if (!isQueueFull) {
				this.addVideo(name, message, value);
			} else {
				toast.warning('Видео не было добавлено', { description: 'Очередь заполнена!' })
			}

			return;
		}

		// for chat messages
		// checking for prefix and register vote
		const hasPrefix = message.startsWith(this._videoRequestPrefix);
		const messageWithoutPrefix = message.replace(this._videoRequestPrefix, '').trim();

		if (hasPrefix && messageWithoutPrefix && !isQueueFull) {
			this.addVideo(name, messageWithoutPrefix, value);
		}

		if (this.canVote) {
			this.poll.addVote(name, message);
		}
	}

	public async loadVideo(video: QueueItemData) {
		const { videoId, startSeconds } = video;

		await this.youtubePlayer.load(videoId, startSeconds);
	}

	public resetVotes(isManual = false) {
		this.poll.reset(isManual);
		this.autoSkipTimer.reset();
	}

	public resumeVideo() {
		this.autoSkipTimer.reset();
		this.youtubePlayer.play();
	}

	private _activateAutoSkipAction() {
		if (this.autoSkipTimer.isRunning || this.autoSkipAction === 'none') return;

		if (this.autoSkipAction === 'skip') {
			this.queue.next();
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
		this.queue.next();
		this.autoSkipTimer.reset();
	}

	private _onVideoUnstarted() {
		this.poll.reset();
		this.paidTimer.reset();
		this.autoSkipTimer.reset();

		if (!this.paidTimerEnabled) return;

		const currentVideo = this.queue.current;
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
		if (!this.shouldLoop) this.queue.next();
	}

	private _onVideoPause() {
		if (!this.queue.current) return;

		const currentIsPaid = this.queue.current.value > 0;

		if (this.paidTimerEnabled && currentIsPaid) {
			this.paidTimer.pause();
		}
	}

	private _onVideoPlay() {
		if (!this.queue.current || this.paidTimer.isPaused) return;

		const currentIsPaid = this.queue.current.value > 0;

		if (this.paidTimerEnabled && currentIsPaid) {
			this.paidTimer.start();
		}
	}

	private _composeQueueItem(params: QueueItemParams): Omit<QueueItemData, 'id' | 'sortOrder'> {
		const color = this._randomColor.get().array();
		const isLive = params.videoData.snippet.liveBroadcastContent === 'live';
		const duration = params.videoData.contentDetails.duration;

		return {
			channelTitle: params.videoData.snippet.channelTitle,
			title: params.videoData.snippet.title,
			thumbnail: params.videoData.snippet.thumbnails.medium.url,
			duration: duration && formatYoutubeDuration(duration),
			videoId: params.videoId,
			viewCount: params.videoData.statistics.viewCount,
			publishedAt: params.videoData.snippet.publishedAt,
			isLive,
			startSeconds: params.startSeconds,
			message: params.message,
			value: params.value,
			isActive: false,
			submittedBy: [params.username],
			color,
		}
	}

	private async _initialize() {
		if (browser) {
			this._isLoadingItems = true;
			await this.queue.initialize();
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
