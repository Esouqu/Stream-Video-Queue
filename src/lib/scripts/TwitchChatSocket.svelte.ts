import tmi from 'tmi.js';
import { SOCKET_STATE } from '../enums';

class TwitchChatSocket {
  private _state = $state<SOCKET_STATE>(SOCKET_STATE.NOT_EXISTS);
  private _socket: tmi.Client | undefined;
  public onMessage: ((channel: string, tags: tmi.ChatUserstate, message: string) => void) | null = null;

  public connect(channelId: string) {
    this._state = SOCKET_STATE.CONNECTING;

    this._socket = new tmi.Client({ channels: [channelId] });

    this._socket.on('connected', () => this._state = SOCKET_STATE.OPEN);
    this._socket.on('message', (channel, tags, message) => {
      this.onMessage?.(channel, tags, message);
    });
    this._socket.on('disconnected', () => this._state = SOCKET_STATE.CLOSED);

    this._socket.connect();
  }

  public disconnect() {
    this._socket?.disconnect();
    this._state = SOCKET_STATE.CLOSED;
  }

  get state() { return this._state; }
}

export default TwitchChatSocket;