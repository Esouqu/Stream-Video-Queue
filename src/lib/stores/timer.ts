import { derived, get, writable } from 'svelte/store';
import { TIMER_STATE } from '$lib/constants';
import { msToHHMMSS } from '$lib/utils';
import settings from './settings';

function createCountdownTimer() {
  const baseTime = writable(0);
  const state = writable(TIMER_STATE.IDLE);
  const time = writable(0);
  const hhmmss = derived(time, ($time) => msToHHMMSS($time));

  let animationId = 0;
  let animationStartTime = 0;
  let animationPausedTime = 0;
  let currentTime = 0;
  let timerState: TIMER_STATE;

  function initialize() {
    state.subscribe((s) => timerState = s);
    settings.timer.subscribe((store) => baseTime.set(store.value * 1000));
  }

  function tick(frameTIme: number) {
    const elapsedTime = frameTIme - animationStartTime;
    const remaining = currentTime - elapsedTime;

    if (remaining <= 0 || timerState === TIMER_STATE.IDLE) {
      reset(0);
    } else {
      time.set(Math.round(remaining));
      animationId = requestAnimationFrame(tick);
    }
  }

  function start(ms?: number) {
    if (ms) setTime(ms);

    animationStartTime = performance.now() - animationPausedTime;
    state.set(TIMER_STATE.RUNNING);
    requestAnimationFrame(tick);
  }

  function pause() {
    if (timerState === TIMER_STATE.PAUSED) return;

    animationPausedTime = performance.now() - animationStartTime;
    cancelAnimationFrame(animationId);
    state.set(TIMER_STATE.PAUSED);
  }

  function add(ms: number) {
    currentTime += ms;
    time.update((state) => state + ms);
  }

  function subtract(ms: number) {
    time.update((state) => {
      if (state <= 0) return state;

      currentTime -= ms;

      return Math.max(0, state - ms);
    });
  }

  function reset(endTime?: number) {
    cancelAnimationFrame(animationId);
    currentTime = 0;
    animationPausedTime = 0;
    time.set(endTime || get(baseTime));
    state.set(TIMER_STATE.IDLE);
  }

  function setTime(ms: number) {
    currentTime = ms;
    time.set(ms);
  }

  return {
    time,
    state,
    hhmmss,
    initialize,
    start,
    pause,
    add,
    subtract,
    reset,
    setTime,
  };
};

const timer = createCountdownTimer();

export default timer;
