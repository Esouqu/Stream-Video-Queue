import type { IConnectionDriver } from "$lib/interfaces";
import type { SocketMessage } from "$lib/types";
import tmi from 'tmi.js';

class TwitchChatDriver implements IConnectionDriver {
	private _socket: tmi.Client | null = null;
	private onMsgCb?: (p: SocketMessage) => void;

	public async connect(config: { roomId: string }) {
		return new Promise<void>((resolve) => {
			this._socket = new tmi.Client({ channels: [config.roomId] });

			this._socket.on('connected', () => resolve());
			this._socket.on('message', (channel, tags, message) => {
				const username = tags['display-name'] || tags.username || '???';

				this.onMsgCb?.({
					name: username,
					message: message,
					value: 0,
					source: 'twitch'
				});
			});

			this._socket.connect();
		});
	}

	public disconnect(): void {
		this._socket?.disconnect();
	}

	public onMessage(callback: (p: SocketMessage) => void) {
		this.onMsgCb = callback;
	}
}

export default TwitchChatDriver;
