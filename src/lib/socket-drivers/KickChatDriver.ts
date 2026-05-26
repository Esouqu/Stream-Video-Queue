import G from "$lib/stores/G.svelte";
import SocketDriver from "./SocketDriver";

type MessageData = {
	id: string
	chatroom_id: number
	content: string
	type: string
	created_at: string
	sender: Sender
	metadata: Metadata
}

type Sender = {
	id: number
	username: string
	slug: string
	identity: Identity
}

type Identity = {
	color: string
	badges: Badge[]
}

type Badge = {
	type: string
	text: string
	count: number
}

type Metadata = {
	message_ref: string
}

class KickChatDriver extends SocketDriver {
	private _pusherKey = '32cbd69e4b950bf97679';
	private _socket: WebSocket | null = null;

	public async connect() {
		const chatroomId = await G.kickApi.getChatroomId();
		if (!chatroomId) {
			throw new Error('Chatroom ID не найден');
		}
		console.log(`Channel Info - Chatroom ID: ${chatroomId}`);

		return new Promise<void>((resolve) => {
			const wsUrl = `wss://ws-us2.pusher.com/app/${this._pusherKey}?protocol=7&client=js&version=7.6.0&flash=false`;

			console.log('Connecting to Pusher...');

			this._socket = new WebSocket(wsUrl);

			this._socket.addEventListener('open', () => {
				resolve();
				console.log('WebSocket connection opened, waiting for connection_established...');
			})
			this._socket.addEventListener('close', (event) => {
				console.log(`Connection closed: Code ${event.code} - ${event.reason}`);
				this.emit('disconnect');
			});
			this._socket.addEventListener('error', () => {
				this.emit('error');
			});

			this._socket.addEventListener('message', (event) => {
				const packet = JSON.parse(event.data);

				if (packet.event === 'pusher:connection_established') {
					const connectionData = JSON.parse(packet.data);
					const socketId = connectionData.socket_id;
					console.log(`Connected with socket ID: ${socketId}`);

					const subscribeMsg = {
						event: 'pusher:subscribe',
						data: {
							auth: '',
							channel: `chatrooms.${chatroomId}.v2`
						}
					};
					this._socket?.send(JSON.stringify(subscribeMsg));
					console.log(`Subscribed to chatroom: chatrooms.${chatroomId}.v2`);
				}

				if (packet.event === 'App\\Events\\ChatMessageEvent') {
					const chatData = JSON.parse(packet.data) as MessageData;
					const username = chatData.sender.username || 'Unknown';
					const message = chatData.content || '';
					console.log(`[Chat] ${username}: ${message}`);

					this.emit('message', {
						name: username,
						message: message,
						value: 0,
						source: 'kick'
					});
				}

				if (packet.event === 'pusher:subscription_succeeded') {
					console.log('Successfully subscribed to channel');
				}
			});
		});

	}

	public disconnect() {
		this._socket?.close();
	}
}

export default KickChatDriver;
