import type { IConnectionDriver } from "$lib/interfaces";
import type { SocketMessage } from "$lib/types";

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

class KickChatDriver implements IConnectionDriver {
	private _pusherKey = '32cbd69e4b950bf97679';
	private _socket: WebSocket | null = null;
	private onMessageCb?: (p: SocketMessage) => void;
	private onDisconnectCb?: () => void;
	private onErrorCb?: () => void;

	public async connect(config: { roomId: string }) {
		// 1. Fetch Chatroom ID using API v2 (as in the working Gist)
		const proxyUrl = 'https://corsproxy.io/?url=';
		const targetUrl = encodeURIComponent(`https://kick.com/api/v2/channels/${config.roomId}`);

		const response = await fetch(proxyUrl + targetUrl);
		const data = await response.json();
		const chatroomId = data.chatroom.id;
		console.log(`Channel Info - Chatroom ID: ${chatroomId}`);

		return new Promise<void>((resolve) => {
			// 2. Use the HARDCODED WebSocket URL from the working Gist
			//    Note: The app key "32cbd69e4b950bf97679" is for ws-us2.pusher.com
			const wsUrl = `wss://ws-us2.pusher.com/app/${this._pusherKey}?protocol=7&client=js&version=7.6.0&flash=false`;

			console.log('Connecting to Pusher...');

			// 3. Connect to the WebSocket
			this._socket = new WebSocket(wsUrl);

			this._socket.addEventListener('open', () => {
				resolve();
				console.log('WebSocket connection opened, waiting for connection_established...');
			})

			this._socket.addEventListener('close', () => {
				console.log(`Connection closed: Code ${event.code} - ${event.reason}`);
				// Reconnect after 5 seconds (optional)
				setTimeout(() => {
					console.log('Attempting to reconnect...');
					this.connect(config);
				}, 5000);
				this.onDisconnectCb?.();
			});
			this._socket.addEventListener('error', () => {
				this.onErrorCb?.();
			});

			this._socket.addEventListener('message', (event) => {
				const packet = JSON.parse(event.data);

				// Handle initial connection response (Pusher handshake)
				if (packet.event === 'pusher:connection_established') {
					const connectionData = JSON.parse(packet.data);
					const socketId = connectionData.socket_id;
					console.log(`Connected with socket ID: ${socketId}`);

					// Subscribe to the chatroom (as shown in the Gist)
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

				// Handle chat messages (same as Gist's Python code)
				if (packet.event === 'App\\Events\\ChatMessageEvent') {
					const chatData = JSON.parse(packet.data) as MessageData;
					const username = chatData.sender.username || 'Unknown';
					const message = chatData.content || '';
					console.log(`[Chat] ${username}: ${message}`);

					this.onMessageCb?.({
						name: username,
						message: message,
						value: 0,
						source: 'kick'
					});
					console.log(chatData);
				}

				// Log other events for debugging (optional)
				if (packet.event === 'pusher:subscription_succeeded') {
					console.log('Successfully subscribed to channel');
				}
			});
		});

	}

	public disconnect() {
		this._socket?.close();
	}

	public onMessage(callback: (p: SocketMessage) => void) {
		this.onMessageCb = callback;
	}

	public onDisconnect(callback: () => void): void {
		this.onDisconnectCb = callback;
	}

	public onError(callback: () => void): void {
		this.onErrorCb = callback;
	}
}

export default KickChatDriver;
