import tmi from 'tmi.js';
import SocketDriver from "./SocketDriver";
import G from "$lib/stores/G.svelte";

class TwitchChatDriver extends SocketDriver {
	private _socket: tmi.Client | null = null;

	public async connect() {
		const username = await G.twitchApi.getUsername();

		console.log(username)
		if (!username) {
			throw new Error('Twitch аккаунт не найден или вы не авторизованы');
		}

		this._socket = new tmi.Client({ channels: [username] });

		this._socket.on('disconnected', () => {
			this.emit('disconnect');
		});

		this._socket.on('message', (_, tags, message) => {
			this.emit('message', {
				name: tags['display-name'] || tags.username || '???',
				message,
				value: 0,
				source: 'twitch'
			});
		});

		await this._socket.connect();

	}

	public disconnect(): void {
		this._socket?.disconnect();
	}
}

export default TwitchChatDriver;
