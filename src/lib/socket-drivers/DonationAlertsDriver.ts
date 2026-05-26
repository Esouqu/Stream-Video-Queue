import G from '$lib/stores/G.svelte';
import SocketDriver from "./SocketDriver";

type DonationAlertsMessage = {
	id: number;
	name: string;
	username: string;
	amount: number;
	amount_in_user_currency: number;
	currency: string;
	message: string;
	created_at: string;
	message_type: string;
	paying_system: string;
	is_shown: boolean;
	recipient_name: string;
	recipient: string;
	shown_at: string;
	reason: string;
}

class DonationAlertsDriver extends SocketDriver {
	private _websocketUrl = 'wss://centrifugo.donationalerts.com/connection/websocket';

	private _socket: WebSocket | null = null;

	public async connect(): Promise<void> {
		const user = await G.donationalertsApi.getUser();

		if (!user?.socket_connection_token) {
			throw new Error('DonationAlerts: Missing socket connection token.');
		}

		const targetChannel = `$alerts:donation_${user.id}`;

		return new Promise<void>((resolve, reject) => {
			this._socket = new WebSocket(this._websocketUrl);

			const timeout = setTimeout(() => {
				this._socket?.close();
				reject(new Error('DonationAlerts: Connection timeout.'));
			}, 10000);

			this._socket.addEventListener('open', () => {
				clearTimeout(timeout);
				this._socket?.send(
					JSON.stringify({
						params: { token: user.socket_connection_token },
						id: 1
					})
				);

				this.emit('connect');
				resolve();
			});

			this._socket.addEventListener('message', async (event) => {
				const message = JSON.parse(event.data);

				// 1. Handle Centrifugo/DonationAlerts connection handshake
				if (message.id === 1 && message.result?.client) {
					const token = await G.donationalertsApi.getSocketToken(String(user.id), message.result.client);
					if (token) {
						this._socket?.send(
							JSON.stringify({
								params: { channel: targetChannel, token: token },
								method: 1,
								id: 2
							})
						);
					}
					return;
				}

				const result = message.result;
				if (!result || !result.data) return;

				if (!result.type && result.channel === targetChannel) {
					const donation: DonationAlertsMessage = result.data.data;

					console.log(`DonationAlerts: New donation: ${donation.username} (${donation.amount_in_user_currency} ${donation.currency})`);
					this.emit('message', {
						name: donation.username ?? 'Аноним',
						value: Math.round(donation.amount_in_user_currency),
						message: donation.message,
						source: 'donationalerts'
					});
				}
			});

			this._socket.addEventListener('close', () => {
				clearTimeout(timeout);
				this.emit('disconnect');
			});

			this._socket.addEventListener('error', (err) => {
				clearTimeout(timeout);
				this.emit('error');
				reject(err);
			});
		});
	}

	public disconnect() {
		this._socket?.close();
	}
}

export default DonationAlertsDriver;