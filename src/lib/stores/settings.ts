import type { IUserInput } from '$lib/interfaces';
import { writable } from 'svelte/store';
import storable from './storable';

function createSettings() {
  const isVotesEnabled = writable(false);
  const isLinksEnabled = writable(false);
  const isDonationEnabled = writable(false);

  const shouldDeletePreviousVideos = storable(false, 'shouldDeletePreviousVideos');
  const percentFromViewCount = storable(7, 'percentFromViewCount');
  const isAutodetection = storable(false, 'isAutodetection');
  const isAddRandomly = storable(false, 'isAddRandomly');
  const isAutoplay = storable(false, 'isAutoPlay');
  const isAutoskip = storable(false, 'isAutoskip');
  const isAutoskipOnEnd = storable(false, 'isAutoskipOnEnd');
  const userInput = storable<IUserInput>({
    keepKeyword: 'Оставить',
    skipKeyword: 'Пропустить',
    needed: 10,
  }, 'userInput');
  const minDonationValue = storable(100, 'minDonationValue');
  const donationSkip = storable<{
    isEnabled: boolean;
    value: number;
    type: 'fixed' | 'percent';
  }>({
    isEnabled: false,
    value: 100,
    type: 'fixed',
  }, 'donationSkipAction');
  const shouldSortPaidVideos = storable(false, 'shouldSortPaidVideos');

  function setNeededVotes(amount: number) {
    userInput.update((input) => ({
      ...input,
      needed: amount
    }));
  }

  return {
    percentFromViewCount,
    isAutodetection,
    isAddRandomly,
    isAutoplay,
    isAutoskip,
    isAutoskipOnEnd,
    userInput,
    minDonationValue,
    isVotesEnabled,
    isLinksEnabled,
    isDonationEnabled,
    shouldDeletePreviousVideos,
    donationSkip,
    shouldSortPaidVideos,
    setNeededVotes,
  }
}

const settings = createSettings();

export default settings;