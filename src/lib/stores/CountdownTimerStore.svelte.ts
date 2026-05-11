import EventEmitter from "$lib/utils/EventEmitter";

type TimerState = 'unstarted' | 'paused' | 'running' | 'finished';

type PlayerEvents = {
	paused: unknown;
	started: unknown;
	finished: unknown;
};

class CountdownTimerStore extends EventEmitter<PlayerEvents> {
	private _baseTime = 600000;
	private _pauseTime = this._baseTime;
	private _animationId = 0;
	private _animationStartTime = 0;
	private _animationPausedTime = 0;
	private _defaultAdjustmentMs = 60000;
	private _maxTime = 60 * 60 * 1000;

	private _time = $state(this._baseTime);
	private _state = $state<TimerState>('unstarted');
	private _beforeTimeUpdate = $state({ ms: 0 });

	public async start(ms?: number) {
		if (this.isRunning) return;

		this._state = 'running';

		if (ms) this.setTime(ms);

		this._animationStartTime = performance.now() - this._animationPausedTime;
		this._animationId = requestAnimationFrame(this._tick.bind(this));

		this.emit('started');
	}

	public pause() {
		if (this.isPaused || this.isUnstarted) return;

		cancelAnimationFrame(this._animationId);
		this._animationPausedTime = performance.now() - this._animationStartTime;
		this._state = 'paused';

		this.emit('paused');
	}

	public subtract(ms = this._defaultAdjustmentMs) {
		this._adjustTime(-ms);
	}

	public add(ms = this._defaultAdjustmentMs) {
		const newTime = this._time + ms;

		if (newTime <= this._maxTime) this._adjustTime(ms);
	}

	public reset() {
		this._resetTime();
		this._state = 'unstarted';
	}

	public stop() {
		this._state = 'finished';
		this._resetTime(0);

		this.emit('finished');
	}

	public setTime(ms: number) {
		this._pauseTime = Math.min(ms, this._maxTime);
		this._time = Math.min(ms, this._maxTime);
	}

	private _tick(frameTime: number) {
		if (this.isFinished) return;

		const remaining = this._pauseTime - (frameTime - this._animationStartTime);

		if (remaining <= 0) {
			this.stop();
			return;
		}

		this._time = (Math.round(remaining));
		this._animationId = requestAnimationFrame(this._tick.bind(this));
	}

	private _adjustTime(ms: number) {
		this._beforeTimeUpdate = { ms };
		this._pauseTime += ms;
		this._time = (Math.max(0, this._time + ms));
	}

	private _resetTime(time = this.baseTime) {
		cancelAnimationFrame(this._animationId);
		this._animationPausedTime = 0;
		this.setTime(time);
	}

	get current() { return this._time; }
	get baseTime() { return this._baseTime; }
	get beforeTimeUpdate() { return this._beforeTimeUpdate; }
	get state() { return this._state; }
	get isUnstarted() { return this._state === 'unstarted'; }
	get isRunning() { return this._state === 'running'; }
	get isPaused() { return this._state === 'paused'; }
	get isFinished() { return this._state === 'finished'; }
};

export default CountdownTimerStore;
