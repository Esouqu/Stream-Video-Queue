import type { IDonationalertsSettings, ITimerSettings } from '$lib/interfaces';
import storable from './storable';

function createSettings() {
  const donationalerts = storable<IDonationalertsSettings>({
    linkAction: {
      isEnabled: false,
      value: 100,
    },
    skipAction: {
      isEnabled: false,
      value: 100,
      type: 'fixed',
    },
  }, 'donationalertsSettings');

  const twitch = storable({
    isLinksEnabled: false,
    isVotesEnabled: false,
    shouldAutoSkip: false,
    votes: {
      keepKeyword: 'Оставить',
      skipKeyword: 'Пропустить',
      needed: 10,
    }
  }, 'twitchSettings');

  const queue = storable({
    shouldAddRandomly: false,
    shouldDeletePreviousVideo: false,
    shouldSortPaidVideos: false,
  }, 'mainSettings');

  const player = storable({
    shouldAutoplay: false,
    shouldPlayNextVideo: false,
  }, 'playerSettings');

  const timer = storable<ITimerSettings>({
    isEnabled: false,
    value: 60,
    type: 'fixed',
  }, 'timerSettings');

  function setTwitchVotes(amount: number) {
    twitch.update((prev) => ({
      ...prev,
      votes: {
        ...prev.votes,
        needed: amount,
      }
    }));
  }

  return {
    donationalerts,
    twitch,
    queue,
    player,
    timer,
    setTwitchVotes,
  }
}

const settings = createSettings();

export default settings;