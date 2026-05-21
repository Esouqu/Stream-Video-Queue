import youtubeApi from "$lib/api/youtubeApi";
import dexieDB from "$lib/db";
import type { MessageSource, QueueItemData, SocketMessage } from "$lib/types";
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
import { SvelteMap } from "svelte/reactivity";
import type MessageSocket from "./MessageSocket.svelte";

type SkipAction = 'none' | 'warning' | 'skip';

type PersistedAppState = {
	queueLimit: number | null;
	payedTimerPricePerMinute: number;
	prioritizedVideoPrice: number;
	shouldLoop: boolean;
	payedTimerEnabled: boolean;
	autoSkipAction: SkipAction;
}

type QueueItemParams = {
	videoData: VideoData;
	videoId: string;
	startSeconds: number;
	username: string;
	message: string;
	value: number;
}

class AppStore {
	readonly youtubePlayer = new YouTubePlayerStore();
	readonly queue = new QueueStore(dexieDB);
	readonly poll = new PollStore();
	readonly autoSkipTimer = new TimerStore();
	readonly payedTimer = new TimerStore('up');

	readonly canVote = $derived(this.poll.isEnabled && this.queue.current);

	private _sockets = new SvelteMap<string, MessageSocket>();
	private _randomColor = new RandomColor();
	private _isLoadingItems = $state(true);

	private _persisted = new PersistedState<PersistedAppState>('appStore', {
		queueLimit: null,
		shouldLoop: false,
		payedTimerEnabled: false,
		payedTimerPricePerMinute: 25,
		prioritizedVideoPrice: 100,
		autoSkipAction: 'warning',
	});

	private _videoRequestPrefix = '!rq';

	get queueLimit() {
		return this._persisted.current.queueLimit;
	}

	set queueLimit(val: number | null) {
		this._persisted.current.queueLimit = val;
	}

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

	get payedTimerEnabled() {
		return this._persisted.current.payedTimerEnabled;
	}
	set payedTimerEnabled(val: boolean) {
		this._persisted.current.payedTimerEnabled = val;
	}

	get payedTimerPricePerMinute() {
		return this._persisted.current.payedTimerPricePerMinute;
	}
	set payedTimerPricePerMinute(val: number) {
		this._persisted.current.payedTimerPricePerMinute = val;
	}

	get prioritizedVideoPrice() {
		return this._persisted.current.prioritizedVideoPrice
	}
	set prioritizedVideoPrice(val: number) {
		this._persisted.current.prioritizedVideoPrice = val;
	}

	get isLoadingItems() {
		return this._isLoadingItems;
	}

	constructor() {
		this._initialize();
	}

	public removeSocket(socketId: MessageSource) {
		const socket = this._sockets.get(socketId);
		socket?.disconnect();
		this._sockets.delete(socketId);
	}

	public addSocket(socket: MessageSocket) {
		socket.onMessage(this.onSocketMessage.bind(this));
		this._sockets.set(socket.id, socket);
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
		const isQueueFull = this.queueLimit && this.queue.size >= this.queueLimit;
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
		this.youtubePlayer.play();
	}

	public resumeVideo() {
		this.youtubePlayer.play();
		this.autoSkipTimer.reset();
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
		this.autoSkipTimer.reset();

		if (this.payedTimerEnabled) {
			const price = this.queue.current?.value;
			if (price) {
				const minutes = price / this.payedTimerPricePerMinute;
				this.payedTimer.reset();
				this.payedTimer.setTime(minutes * 60 * 1000);
			}
		}
	}

	private _onVideoEnded() {
		if (!this.shouldLoop) this.queue.next();
	}

	private _onVideoPause() {
		if (this.payedTimerEnabled) {
			this.payedTimer.pause();
		}
	}

	private _onVideoPlay() {
		if (this.payedTimerEnabled) {
			this.payedTimer.start();
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
			this.payedTimer.on('finished', this._activateAutoSkipAction.bind(this));
			this.poll.on('finished', this._activateAutoSkipAction.bind(this));
		}
	}

	private _getRandomItems() {
		const items = Array.from({ length: 200 }, () => ({
			id: crypto.randomUUID() as string,
			title: `${crypto.randomUUID().slice(0, 5)}`,
			value: Math.floor(Math.random() * 1000),
			thumbnail: 'https://i.ytimg.com/vi/GkG60kISnfc/hqdefault.jpg?sqp=-oaymwEmCKgBEF5IWvKriqkDGQgBFQAAiEIYAdgBAeIBCggYEAIYBjgBQAE=&rs=AOn4CLC838QzSTZsByv8P3WDpvj0PR2XTQ',
			color: this._randomColor.get().array()
		} as unknown as QueueItemData));

		return items;
	}
}

const appStore = new AppStore();
export default appStore;
