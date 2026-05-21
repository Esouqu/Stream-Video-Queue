import tmi from 'tmi.js';
import MessageSocket from './MessageSocket.svelte';
import type { SocketConnectionData } from '$lib/types';

class KickChatSocket extends MessageSocket {
	private _socket?: tmi.Client;

	constructor({ roomId }: SocketConnectionData) {
		super('twitch', 'bg-lime-500', `${roomId}`);
	}

	public changeChannelId(channelId: string) {
		this._roomId = channelId;
	}

	public async connect() {
		this._state = 'connecting';

		this._socket = new tmi.Client({ channels: [this._roomId] });

		this._socket.on('connected', () => this._state = 'open');
		this._socket.on('message', (channel, tags, message) => {
			const username = tags['display-name'] || tags.username || '???';

			for (const handler of this._messageListeners) {
				handler({
					name: username,
					message: message,
					value: 0,
					source: 'kick'
				});
			}
		});
		this._socket.on('disconnected', () => this._state = 'closed');

		this._socket.connect();
	}

	public disconnect() {
		this._socket?.disconnect();
		this._state = 'closed';
	}
}

export default KickChatSocket;