import { writable } from 'svelte/store';
import type { IDonationAlertsUserData, IDonationData, IQueueVideoInfo, IToggleWithInput } from '../interfaces';
import { SOCKET_STATE } from '../constants';
import queue from './queue';
import settings from './settings';
import { extractYoutubeVideoData } from '../utils';

function createCentrifugo() {
  const state = writable<SOCKET_STATE>(SOCKET_STATE.CLOSED);
  const minuteInSeconds = 60;

  let socket: WebSocket;
  let linkAction: IToggleWithInput;
  let skipAction: { isEnabled: boolean, value: number, type: 'fixed' | 'percent' };
  let currentVideo: IQueueVideoInfo | undefined;
  let timerType: 'fixed' | 'perMinute';

  function initialize() {
    settings.donationalerts.subscribe((store) => {
      linkAction = store.linkAction;
      skipAction = store.skipAction;
    });
    settings.timer.subscribe((store) => timerType = store.type);
    queue.currentVideo.subscribe((store) => currentVideo = store)
  }

  async function connect(user: IDonationAlertsUserData) {
    state.set(SOCKET_STATE.CONNECTING);
    socket = new WebSocket('wss://centrifugo.donationalerts.com/connection/websocket');

    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          params: { token: user.socket_connection_token },
          id: 1
        })
      );
    });

    socket.addEventListener('message', async (event) => {
      const message = JSON.parse(event.data);
      const centrifugoChannel = `$alerts:donation_${user.id}`;

      if (message.id === 1) {
        const socketToken = await fetch('/api/centrifugo/subscribe', {
          method: 'POST',
          body: JSON.stringify({
            channels: [centrifugoChannel],
            client: message.result.client
          })
        }).then((res) => res.json()).then((data: string) => data);

        socket.send(
          JSON.stringify({
            params: {
              channel: centrifugoChannel,
              token: socketToken
            },
            method: 1,
            id: 2
          })
        );

        state.set(SOCKET_STATE.OPEN);
      }

      if (!message.result.type && message.result.channel === centrifugoChannel) {
        const donation: IDonationData = message.result.data.data;

        processDonation(donation);
      }
    });

    socket.addEventListener('close', () => {
      state.set(SOCKET_STATE.CLOSED);
    });

    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      state.set(SOCKET_STATE.CLOSED);
    });
  }

  function processDonation(donation: IDonationData) {
    const roundedAmount = Math.round(donation.amount_in_user_currency);
    const username = donation.username ?? 'Аноним';
    const videoData = extractYoutubeVideoData(donation.message);
    const dynamicSkipValue = currentVideo ? skipAction.value / 100 * currentVideo.price : 0;
    const skipPrice = skipAction.type === 'fixed' ? skipAction.value : dynamicSkipValue;

    if (videoData && linkAction.isEnabled && roundedAmount >= linkAction.value) {
      const startSeconds = videoData.startSeconds;
      const paidSeconds = Math.round(roundedAmount / linkAction.value * minuteInSeconds);
      const isStartAndEndSecondsSame = startSeconds + paidSeconds === startSeconds;
      let endSeconds = isStartAndEndSecondsSame || timerType === 'perMinute' ? undefined : startSeconds + paidSeconds;

      if (timerType === 'fixed') {
        endSeconds = 60;
      } else {
        endSeconds = paidSeconds;
      }

      queue.add({
        videoId: videoData.videoId,
        startSeconds,
        endSeconds,
        username,
        price: roundedAmount,
        message: donation.message,
        isPaid: true,
      });
    } else if (skipAction.isEnabled && roundedAmount === skipPrice) {
      queue.setNext();
    }
  }

  function disconnect() {
    socket.close();
    state.set(SOCKET_STATE.CLOSED);
  }

  return {
    state,
    connect,
    disconnect,
    initialize,
    processDonation,
  }
}

const centrifugo = createCentrifugo();

export default centrifugo;