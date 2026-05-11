import EventEmitter from "$lib/utils/EventEmitter";

type PlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'video_cued';

type PlayerEvents = {
	ready: unknown;
	play: unknown;
	pause: unknown;
	ended: unknown;
	error: unknown;
	timeupdate: unknown;
	unstarted: unknown;
};

abstract class VideoPlayerStore<T> extends EventEmitter<PlayerEvents> {
	protected _player: T | undefined;
	protected _state = $state<PlayerState>('unstarted');
	protected _isReady = $state(false);
	protected _error = $state<unknown>();

	get error() { return this._error; }
	get isReady() { return this._isReady; }
	get isUnstarted() { return this._state === 'unstarted'; }
	get isBuffering() { return this._state === 'buffering'; }
	get isPlaying() { return this._state === 'playing'; }
	get isPaused() { return this._state === 'paused'; }
	get isEnded() { return this._state === 'ended'; }
	get canPlay() { return this.isUnstarted || this.isPaused || this.isEnded }

	public abstract load(videoId: string, startSeconds?: number): Promise<void>;
	public abstract cue(videoId: string, startSeconds?: number): Promise<void>;
	public abstract play(): Promise<void>;
	public abstract pause(): Promise<void>;
	public abstract stop(): Promise<void>;
	public abstract seek(seconds: number): Promise<void>;
	public abstract setVolume(volume: number): Promise<void>;
	public abstract mute(): Promise<void>;
	public abstract unmute(): Promise<void>;
	public abstract getCurrentTime(): Promise<number>;
	public abstract getDuration(): Promise<number>;
	public abstract destroy(): Promise<void>;

	static parseUrl(url: string) {
		if (url.includes('youtube.com') || url.includes('youtu.be')) {
			const videoId = url.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1] || '';
			return { type: 'youtube', videoId };
		}
		if (url.includes('twitch.tv')) {
			const videoId = url.match(/videos\/(\d+)/)?.[1] ||
				url.match(/twitch\.tv\/(\w+)/)?.[1] || '';
			return { type: 'twitch', videoId };
		}
		throw new Error('Unsupported URL');
	}
}

export default VideoPlayerStore;
