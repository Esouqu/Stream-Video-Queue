import type { YouTubePlayer as YTPType } from "youtube-player/dist/types";
import VideoPlayer from "./VideoPlayerStore.svelte";
import YouTubePlayer from 'youtube-player';
import { browser } from "$app/environment";
import { toast } from "svelte-sonner";

export enum YOUTUBE_PLAYER_STATE {
	UNSTARTED = -1,
	ENDED = 0,
	PLAYING = 1,
	PAUSED = 2,
	BUFFERING = 3,
	VIDEO_CUED = 5,
}

class YouTubePlayerStore extends VideoPlayer<YTPType> {
	public async initialize(container: HTMLDivElement) {
		if (browser) {
			try {
				this._player = YouTubePlayer(container, { playerVars: { rel: 0, autoplay: 0 } });
				this._player.on('ready', () => {
					this._isReady = true;
					this.emit('ready');
				});
				this._player.on('stateChange', (event) => this._handleStateChange(event));
				this._player.on('error', (error) => {
					this._error = error;
					this.emit('error', error);
				});
			} catch (err) {
				console.log(err)
				toast((err as Error).message);
			}

		}
	}

	public async load(videoId: string, startSeconds?: number) {
		await this._player?.loadVideoById(videoId, startSeconds);
	}

	public async cue(videoId: string, startSeconds?: number) {
		await this._player?.cueVideoById(videoId, startSeconds);
	}

	public async play() {
		await this._player?.playVideo();
	}

	public async pause() {
		await this._player?.pauseVideo();
	}

	public async stop() {
		await this._player?.stopVideo();
	}

	public async seek(seconds: number) {
		await this._player?.seekTo(seconds, true);
	}

	public async setVolume(volume: number) {
		await this._player?.setVolume(volume * 100); // YT uses 0-100
	}

	public async mute() {
		await this._player?.mute();
	}

	public async unmute() {
		await this._player?.unMute();
	}

	public async getCurrentTime() {
		return await this._player?.getCurrentTime() || 0;
	}

	public async getDuration() {
		return await this._player?.getDuration() || 0;
	}

	public async destroy() {
		this._player?.destroy();
		this._eventListeners.clear();
	}

	private _handleStateChange(event: CustomEvent<unknown> & { data: YOUTUBE_PLAYER_STATE }) {
		switch (event.data) {
			case YOUTUBE_PLAYER_STATE.UNSTARTED:
				this.emit('unstarted');
				this._state = 'unstarted';
				break;
			case YOUTUBE_PLAYER_STATE.PLAYING:
				this.emit('play');
				this._state = 'playing';
				break;
			case YOUTUBE_PLAYER_STATE.PAUSED:
				this.emit('pause');
				this._state = 'paused';
				break;
			case YOUTUBE_PLAYER_STATE.ENDED:
				this.emit('ended');
				this._state = 'ended';
				break;
			case YOUTUBE_PLAYER_STATE.BUFFERING:
				this._state = 'buffering';
				break;
		}
	}
}

export default YouTubePlayerStore;
