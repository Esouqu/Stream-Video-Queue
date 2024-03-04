import type { IUserInput } from '$lib/interfaces';
import storable from './storable';

function createSettings() {
  const percentFromViewCount = storable(7, 'percentFromViewCount');
  const isAutodetection = storable(false, 'isAutodetection');
  const isAddRandomly = storable(false, 'isAddRandomly');
  const isAutoplay = storable(false, 'isAutoPlay');
  const isAutoskip = storable(false, 'isAutoskip');
  const userInput = storable<IUserInput>({
    keepKeyword: 'Оставить',
    skipKeyword: 'Пропустить',
    needed: 10,
  }, 'userInput');
  const minDonationValue = storable(100, 'minDonationValue');

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
    userInput,
    setNeededVotes,
    minDonationValue,
  }
}

const settings = createSettings();

export default settings;