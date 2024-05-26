import { writable } from 'svelte/store';
import type { IDonationAlertsUserData, IDonationData, IQueueVideoInfo } from './interfaces';
import { SOCKET_STATE } from './constants';
import queue from './stores/queue';
import settings from './stores/settings';
import { extractYoutubeVideoData } from './utils';

function createCentrifugo() {
  const state = writable<SOCKET_STATE>(SOCKET_STATE.CLOSED);

  let socket: WebSocket;
  let minDonationValue: number;
  let isDonationEnabled: boolean;
  let donationSkip: { isEnabled: boolean, value: number, type: 'fixed' | 'percent' };
  let currentVideo: IQueueVideoInfo | undefined;

  function initialize() {
    settings.minDonationValue.subscribe((store) => minDonationValue = store);
    settings.isDonationEnabled.subscribe((store) => isDonationEnabled = store);
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
        const roundedAmount = Math.round(donation.amount_in_user_currency);

        if (roundedAmount < minDonationValue) return;

        const username = donation.username ?? 'Аноним';
        const videoData = extractYoutubeVideoData(donation.message);

        if (donationSkip.isEnabled && currentVideo) {
          const dynamicValue = donationSkip.value / 100 * currentVideo.price;

          if (donationSkip.type === 'fixed' && roundedAmount === donationSkip.value) {
            queue.setNext();
          } else if (donationSkip.type === 'percent' && roundedAmount === dynamicValue) {
            queue.setNext();
          }
        }

        if (videoData && isDonationEnabled) queue.add({
          username,
          price: roundedAmount,
          message: donation.message,
          isPaid: true,
          ...videoData,
        });
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