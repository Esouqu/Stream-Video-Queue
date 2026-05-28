import { clamp } from "$lib/utils";
import EventEmitter from "$lib/utils/EventEmitter";

type TimerState = 'unstarted' | 'paused' | 'running' | 'finished';

type PlayerEvents = {
	paused: unknown;
	started: unknown;
	finished: unknown;
};

type TimerType = 'up' | 'down';

class TimerStore extends EventEmitter<PlayerEvents> {
	private _startTime = $state(0);
	private _current = $state(this._startTime);
	private _state = $state<TimerState>('unstarted');

	private _animationId = 0;
	private _startTimestamp = 0;
	private _pauseTimestamp = 0;
	private _defaultAdjustmentMs = 10000;
	private _type: TimerType;

	get current() {
		return this._current;
	}

	get startTime() {
		return this._startTime;
	}

	get state() {
		return this._state;
	}

	get isUnstarted() {
		return this._state === 'unstarted';
	}

	get isRunning() {
		return this._state === 'running';
	}

	get isPaused() {
		return this._state === 'paused';
	}

	get isFinished() {
		return this._state === 'finished';
	}

	constructor(type: TimerType = 'down') {
		super();
		this._type = type;
	}

	public async start(ms?: number) {
		if (this.isRunning || (this._startTime === 0 && !ms)) return;

		if (ms) this.set(ms);

		this._state = 'running';
		this.emit('started');

		this._startTimestamp = performance.now() - this._pauseTimestamp;
		this._animationId = requestAnimationFrame(this._tick.bind(this));
	}

	public pause() {
		if (this.isPaused || this.isUnstarted) return;

		cancelAnimationFrame(this._animationId);
		this._pauseTimestamp = performance.now() - this._startTimestamp;
		this._state = 'paused';

		this.emit('paused');
	}

	public subtract(ms = this._defaultAdjustmentMs) {
		this._adjustTime(-ms);
	}

	public add(ms = this._defaultAdjustmentMs) {
		this._adjustTime(ms);
	}

	public reset(time = this._type === 'down' ? this._startTime : 0) {
		cancelAnimationFrame(this._animationId);
		this._pauseTimestamp = 0;

		this._current = time;
		this._state = 'unstarted';
	}

	public stop() {
		cancelAnimationFrame(this._animationId);
		this._pauseTimestamp = 0;

		this._state = 'finished';
		this.emit('finished');
	}

	public set(ms: number) {
		this._startTime = ms;

		if (this._type === 'down') {
			this._current = ms;
		}
	}

	private _tick(frameTime: number) {
		if (this.isFinished || this.isUnstarted) return;

		const diff = (frameTime - this._startTimestamp);
		const current = this._type === 'down' ? this._startTime - diff : diff;
		const isFinished = this._type === 'down' ? current <= 0 : current >= this._startTime;

		this._current = clamp(current, 0, this._startTime);

		if (isFinished) {
			this.stop();
			return;
		}

		this._animationId = requestAnimationFrame(this._tick.bind(this));
	}

	private _adjustTime(ms: number) {
		this._startTime += ms;

		if (this._type === 'down') {
			this._current = Math.max(0, this._current + ms);
		}
	}
};

export default TimerStore;
