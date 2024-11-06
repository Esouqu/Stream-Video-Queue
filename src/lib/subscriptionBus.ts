import centrifugo from "./stores/centrifugo";
import queue from "./stores/queue";
import timer from "./stores/timer";
import votes from "./stores/votes";

function initializeSubscriptions() {
  const stores = [queue, votes, centrifugo, timer];

  for (const s of stores) s.initialize();
}

export default initializeSubscriptions;