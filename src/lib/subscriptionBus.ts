import queue from "./stores/queue";
import votes from "./stores/votes";

function initializeSubscriptions() {
  const stores = [queue, votes];

  for (const s of stores) {
    s.initialize();
  }
}

export default initializeSubscriptions;