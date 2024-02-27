import { writable, type Unsubscriber } from 'svelte/store';
import type { IDonationAlertsUserData, IDonationData } from './interfaces';
import { SOCKET_STATE } from './constants';
import queue from './stores/queue';
import settings from './stores/settings';
import { extractYoutubeVideoData } from './utils';

function createCentrifugo() {
  const state = writable<SOCKET_STATE>(SOCKET_STATE.CLOSED);
  let socket: WebSocket;
  let minDonationValue: number;
  let unsubscribeMinDonationValue: Unsubscriber;

  async function connect(user: IDonationAlertsUserData) {
    state.set(SOCKET_STATE.CONNECTING);
    socket = new WebSocket('wss://centrifugo.donationalerts.com/connection/websocket');

    unsubscribeMinDonationValue = settings.minDonationValue.subscribe((value) => {
      minDonationValue = value;
    });

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
        }).then((res) => res.json());

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

        if (videoData) queue.add(videoData, username, true);
      }
    });

    socket.addEventListener('close', () => {
      state.set(SOCKET_STATE.CLOSED);
      unsubscribeMinDonationValue();
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
  }
}

const centrifugo = createCentrifugo();

export default centrifugo;