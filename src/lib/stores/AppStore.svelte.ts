import youtubeApi from "$lib/api/youtubeApi";
import db from "$lib/db";
import type { QueueItemData } from "$lib/types";
import type { VideoData } from "$lib/api/types";
import { extractYoutubeVideoData, formatYoutubeDuration } from "$lib/utils";
import QueueStore from "./QueueStore.svelte";
import PollStore from "./PollStore.svelte";
import type tmi from 'tmi.js';
import RandomColor from "./RandomColorStore";
import { browser } from "$app/environment";
import { toast } from "svelte-sonner";
import YouTubePlayerStore from "./YoutubePlayerStore.svelte";
import { PersistedState } from "runed";
import CountdownTimerStore from "./CountdownTimerStore.svelte";

type EnoughVotesAction = 'none' | 'warning' | 'skip';

type PersistedAppState = {
	queueLimit: number | null;
	shouldLoop: boolean;
	enoughVotesAction: EnoughVotesAction;
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
	readonly twitchQueue = new QueueStore<QueueItemData>('twitchQueue');
	readonly poll = new PollStore();
	readonly autoSkipTimer = new CountdownTimerStore();

	private _randomColor = new RandomColor();
	private _isLoadingItems = $state(true);

	private _persisted = new PersistedState<PersistedAppState>('appStore', {
		queueLimit: null,
		shouldLoop: false,
		enoughVotesAction: 'warning',
	});

	private _videoRequestPrefix = '!rq';

	get queueLimit() {
		return this._persisted.current.queueLimit;
	}

	set queueLimit(val: number | null) {
		this._persisted.current.queueLimit = val;
	}

	get enoughVotesAction() {
		return this._persisted.current.enoughVotesAction;
	}

	set enoughVotesAction(val: EnoughVotesAction) {
		this._persisted.current.enoughVotesAction = val;
	}

	get shouldLoop() {
		return this._persisted.current.shouldLoop;
	}

	set shouldLoop(val: boolean) {
		this._persisted.current.shouldLoop = val;
	}

	get isLoadingItems() {
		return this._isLoadingItems;
	}

	constructor() {
		this._initialize();
	}

	public async removeVideo(video: QueueItemData) {
		// await db.removeQueueItem(video);
		this.twitchQueue.dequeue(video);
		toast.message("Видео удалено из очереди", {
			description: video.title,
		});
	}

	public async addVideo(username: string, message: string, value = 0) {
		if (!message) return;

		const data = extractYoutubeVideoData(message);
		if (!data) {
			console.error(`No video data found in message: "${message}"`);
			return;
		};

		const existingItem = await db.getQueueItem(data.videoId);

		if (existingItem) {
			await db.updateQueueItem(existingItem, username);
			// this.twitchQueue.updatePriotity(existingItem);
			return;
		}

		try {
			const videoData = await youtubeApi.getVideo(data.videoId);
			const newItem = this._composeQueueItem({
				videoData,
				username,
				message,
				value,
				...data
			});

			const id = await db.addQueueItem(newItem);
			this.twitchQueue.enqueue({ id, ...newItem });

			toast.message("Видео добавлено", {
				description: videoData.snippet.title,
			});
		} catch (err) {
			toast((err as Error).message);
		}
	}

	public onChatMessage(_channel: string, tags: tmi.ChatUserstate, message: string) {
		const username = tags['display-name'] || tags.username || 'unknown';
		const canRequest = message.startsWith(this._videoRequestPrefix);
		const isQueueFull = this.queueLimit && this.twitchQueue.size >= this.queueLimit;
		const canVote = this.poll.isEnabled;

		if (canRequest && !isQueueFull) {
			this.addVideo(username, message.replace('!rq', '').trim());
		}

		if (canVote) {
			this.poll.addVote(username, message);
		}
	}

	public async loadVideo(video: QueueItemData) {
		const { videoId, startSeconds } = video;

		await this.youtubePlayer.load(videoId, startSeconds);
	}

	public resetVotes() {
		this.poll.reset();
		this.autoSkipTimer.reset();
		this.youtubePlayer.play();
	}

	public resumeVideo() {
		this.youtubePlayer.play();
		this.autoSkipTimer.reset();
	}

	private _onAutoSkipTimerFinished() {
		this.twitchQueue.next();
		this.autoSkipTimer.reset();
	}

	private _onEnoughVotes() {
		if (this.enoughVotesAction === 'none') return;

		if (this.enoughVotesAction === 'skip') {
			this.twitchQueue.next();
			this.poll.reset();

			return;
		}

		if (this.enoughVotesAction === 'warning') {
			this.youtubePlayer.pause();
			this.autoSkipTimer.start(7000);

			return;
		}
	}

	private _onVideoUnstarted() {
		this.autoSkipTimer.reset();
	}

	private _onVideoEnded() {
		if (!this.shouldLoop) this.twitchQueue.next();
	}

	private _composeQueueItem(params: QueueItemParams): Omit<QueueItemData, 'id'> {
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
			submittedBy: [params.username],
			color,
			isWatched: false,
		}
	}

	private async _initialize() {
		if (browser) {
			// load items from indexeddb
			this._isLoadingItems = true;
			const items = await db.getQueueItems();
			this.twitchQueue.setItems(items);
			// this.twitchQueue.setItems(this._getRandomItems());
			this._isLoadingItems = false;

			// connect events
			this.youtubePlayer.on('unstarted', this._onVideoUnstarted.bind(this));
			this.youtubePlayer.on('ended', this._onVideoEnded.bind(this));
			this.autoSkipTimer.on('finished', this._onAutoSkipTimerFinished.bind(this));
			this.poll.on('finished', this._onEnoughVotes.bind(this));
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
