import { writable } from 'svelte/store';
import type { IDonationAlertsUserData, IDonationData, IQueueVideoInfo } from './interfaces';
import { SOCKET_STATE } from './constants';
import queue from './stores/queue';
import settings from './stores/settings';
import { extractYoutubeVideoData } from './utils';

function createCentrifugo() {
  const state = writable<SOCKET_STATE>(SOCKET_STATE.CLOSED);

  let socket: WebSocket;
  let minYoutubeLinkPrice: number;
  let isYoutubeLinksEnabled: boolean;
  let donationSkip: { isEnabled: boolean, value: number, type: 'fixed' | 'percent' };
  let currentVideo: IQueueVideoInfo | undefined;

  function initialize() {
    settings.minDonationValue.subscribe((store) => minYoutubeLinkPrice = store);
    settings.isDonationEnabled.subscribe((store) => isYoutubeLinksEnabled = store);
    settings.donationSkip.subscribe((store) => donationSkip = store);
    queue.currentVideo.subscribe((store) => currentVideo = store)
  }

  async function connect(user: IDonationAlertsUserData) {
    state.set(SOCKET_STATE.CONNECTING);
    socket = new WebSocket('wss://centrifugo.donationalerts.com/connection/websocket');

    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          params: {
            token: user.socket_connection_token
          },
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
    const dynamicSkipValue = currentVideo ? donationSkip.value / 100 * currentVideo.price : 0;
    const skipPrice = donationSkip.type === 'fixed' ? donationSkip.value : dynamicSkipValue;

    if (videoData && isYoutubeLinksEnabled && roundedAmount >= minYoutubeLinkPrice) {
      queue.add({
        ...videoData,
        username,
        price: roundedAmount,
        message: donation.message,
        isPaid: true,
      });
    } else if (donationSkip.isEnabled && roundedAmount === skipPrice) {
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
  }
}

const centrifugo = createCentrifugo();

export default centrifugo;