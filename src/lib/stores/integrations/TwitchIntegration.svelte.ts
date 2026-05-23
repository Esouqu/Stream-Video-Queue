// import tmi from 'tmi.js';
import Integration from './Integration.svelte';

class TwitchIntegration extends Integration {
	// private _socket?: tmi.Client;

	// constructor({ roomId }: SocketConnectionData) {
	// 	super({
	// 		id: 'twitch',
	// 		color: 'text-purple-500',
	// 		icon: TwitchIcon2,
	// 		roomId: `${roomId}`
	// 	});
	// }

	public async connect() {
		this.changeState('connecting');

		await new Promise((resolve) => setTimeout(() => resolve(null), 1000));
		this.changeState('open');

		// this._socket = new tmi.Client({ channels: [this._roomId] });

		// this._socket.on('connected', () => this._state = 'open');
		// this._socket.on('message', (channel, tags, message) => {
		// 	const username = tags['display-name'] || tags.username || '???';

		// 	for (const handler of this._messageListeners) {
		// 		handler({
		// 			name: username,
		// 			message: message,
		// 			value: 0,
		// 			source: 'twitch'
		// 		});
		// 	}
		// });
		// this._socket.on('disconnected', () => this._state = 'closed');

		// this._socket.connect();
	}

	public disconnect() {
		// this._socket?.disconnect();
		this.changeState('closed');
	}
}

export default TwitchIntegration;