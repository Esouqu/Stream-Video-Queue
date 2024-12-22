import { TIMER_STATE } from '$lib/enums';
import { msToHHMMSS } from '$lib/utils';
import { storable } from './LocalStore.svelte';

type OnStateFinishedActionType = 'pause' | 'next' | 'none';

interface ITimerSettings {
  isEnabled: boolean;
  pricePerSecond: number;
  onStateFinishedAction: OnStateFinishedActionType;
}

class Timer {
  private _settings = storable<ITimerSettings>({
    isEnabled: false,
    pricePerSecond: 20,
    onStateFinishedAction: 'pause',
  }, 'timerSettings');

  private _time = $state(0);
  private _state = $state(TIMER_STATE.UNSTARTED);
  public hhmmss = $derived.by(() => msToHHMMSS(this._time));

  private _currentTime = 0;
  private _animationId = 0;
  private _animationStartTime = 0;
  private _animationPausedTime = 0;

  public start(ms?: number) {
    if (ms) this.setTime(ms);

    this._animationStartTime = performance.now() - this._animationPausedTime;
    this._state = TIMER_STATE.RUNNING;
    this._animationId = requestAnimationFrame(this.tick.bind(this));
  }

  public pause() {
    if (this._state === TIMER_STATE.PAUSED || this._state === TIMER_STATE.UNSTARTED) return;

    cancelAnimationFrame(this._animationId);
    this._animationPausedTime = performance.now() - this._animationStartTime;
    this._state = TIMER_STATE.PAUSED;
  }

  public add(ms: number) {
    this._currentTime += ms;
    this._time += ms;
  }

  public subtract(ms: number) {
    this._time = this._time <= 0 ? 0 : Math.max(0, this._time - ms);
    this._currentTime -= ms;
  }

  public reset() {
    this._resetTime();
    this._state = TIMER_STATE.UNSTARTED;
  }

  public stop() {
    this._resetTime();
    this._state = TIMER_STATE.FINISHED;
  }

  public setTime(ms: number) {
    this._currentTime = ms;
    this._time = ms;
  }

  private tick(frameTime: number) {
    const elapsedTime = frameTime - this._animationStartTime;
    const remaining = this._currentTime - elapsedTime;

    if (remaining <= 0) {
      this.stop();
    } else {
      this._time = Math.round(remaining);
      this._animationId = requestAnimationFrame(this.tick.bind(this));
    }
  }

  private _resetTime() {
    cancelAnimationFrame(this._animationId);
    this._time = 0;
    this._currentTime = 0;
    this._animationPausedTime = 0;
  }

  get time() { return this._time; }
  get state() { return this._state; }

  get isEnabled() { return this._settings.value.isEnabled; }
  set isEnabled(value: boolean) { this._settings.value.isEnabled = value; }

  get pricePerSecond() { return this._settings.value.pricePerSecond; }
  set pricePerSecond(value: number) { this._settings.value.pricePerSecond = value; }

  get onStateFinishedAction() { return this._settings.value.onStateFinishedAction; }
  set onStateFinishedAction(value: OnStateFinishedActionType) { this._settings.value.onStateFinishedAction = value; }
};

export default Timer;
