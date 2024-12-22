import type { IDonationAlertsUserData, IDonationSocketData } from '../interfaces';
import { SOCKET_STATE } from '../enums';

class CentrifugoSocket {
  private _state: SOCKET_STATE = $state(SOCKET_STATE.CLOSED);
  private _socket: WebSocket | undefined;
  public onDonation: ((donation: IDonationSocketData) => void) | undefined;

  public async connect(user: IDonationAlertsUserData) {
    this._state = SOCKET_STATE.CONNECTING;
    this._socket = new WebSocket('wss://centrifugo.donationalerts.com/connection/websocket');

    this._socket.addEventListener('open', () => {
      this._socket?.send(
        JSON.stringify({
          params: { token: user.socket_connection_token },
          id: 1
        })
      );
    });

    this._socket.addEventListener('message', async (event) => {
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

        this._socket?.send(
          JSON.stringify({
            params: {
              channel: centrifugoChannel,
              token: socketToken
            },
            method: 1,
            id: 2
          })
        );

        this._state = SOCKET_STATE.OPEN;
      }

      if (!message.result.type && message.result.channel === centrifugoChannel) {
        const donation: IDonationSocketData = message.result.data.data;

        this.onDonation?.(donation);
      }
    });

    this._socket.addEventListener('close', () => {
      this._state = SOCKET_STATE.CLOSED;
    });

    this._socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      this._state = SOCKET_STATE.CLOSED;
    });
  }

  public disconnect() {
    this._socket?.close();
    this._state = SOCKET_STATE.CLOSED;
  }

  get state() { return this._state }
}

export default CentrifugoSocket;