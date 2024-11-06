import { derived, writable } from 'svelte/store';
import settings from './settings';
import type { IUserInput } from '$lib/interfaces';

function createVotes() {
  const counter = writable({ keep: 0, skip: 0 });
  const difference = derived(counter, ($counter) => Math.max(0, $counter.skip - $counter.keep));

  let votesInput: IUserInput;

  function initialize() {
    settings.twitch.subscribe((store) => votesInput = store.votes);
  }

  function addVote(keyword: string) {
    const { keepKeyword, skipKeyword } = votesInput;
    const isKeepKeyword = keyword.toLowerCase() === keepKeyword.toLowerCase();
    const isSkipKeyword = keyword.toLowerCase() === skipKeyword.toLowerCase();

    counter.update((item) => {
      if (isKeepKeyword) return { ...item, keep: item.keep + 1 };
      if (isSkipKeyword) return { ...item, skip: item.skip + 1 };
      return item;
    });
  }

  function resetCounter() {
    counter.set({ keep: 0, skip: 0 });
  }

  return {
    subscribe: counter.subscribe,
    difference,
    initialize,
    addVote,
    resetCounter,
  }
}

const votes = createVotes();

export default votes;