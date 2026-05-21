import { toast } from 'svelte-sonner';
import donationAlertsApi from '$lib/api/donationalertsApi.svelte';
import MessageSocket from './MessageSocket.svelte';
import type { SocketConnectionData } from '$lib/types';

interface DonationAlertsDonationMessage {
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

class DonationAlertsSocket extends MessageSocket {
	private _socket: WebSocket | undefined;
	private _socketToken: string | undefined;

	constructor({ roomId, socketToken }: SocketConnectionData) {
		super('donationalerts', 'bg-amber-500', `$alerts:donation_${roomId}`);
		this._socketToken = socketToken;
	}

	public async connect() {
		if (!this._socketToken) return;

		this._state = 'connecting';
		this._socket = new WebSocket('wss://centrifugo.donationalerts.com/connection/websocket');

		this._socket.addEventListener('open', () => {
			this._socket?.send(
				JSON.stringify({
					params: { token: this._socketToken },
					id: 1
				})
			);
		});

		this._socket.addEventListener('message', async (event) => {
			const message = JSON.parse(event.data);

			if (message.id === 1) {
				let socketToken: string | undefined;

				try {
					const data = await donationAlertsApi.getSocketToken(this._roomId, message.result.client);

					if (!data) {
						throw new Error('No token received');
					}

					socketToken = data;

				} catch {
					toast.error(
						"Ошибка при подключении к DonationAlerts",
						{ description: "Попробуйте еще раз." }
					);
					this._state = 'closed';
					return;
				}

				this._socket?.send(
					JSON.stringify({
						params: {
							channel: this._roomId,
							token: socketToken
						},
						method: 1,
						id: 2
					})
				);

				this._state = 'open';
			}

			if (!message.result.type && message.result.channel === this._roomId) {
				const donation: DonationAlertsDonationMessage = message.result.data.data;
				const username = donation.username ?? 'Аноним';
				const amount = Math.round(donation.amount_in_user_currency);

				for (const handler of this._messageListeners) {
					handler({
						name: username,
						value: amount,
						message: donation.message,
						source: 'donationalerts'
					});
				}
			}
		});

		this._socket.addEventListener('close', () => {
			this._state = 'closed';
		});

		this._socket.addEventListener('error', (event) => {
			console.error('WebSocket error:', event);
			this._state = 'closed';
		});
	}

	public disconnect() {
		this._socket?.close();
		this._state = 'closed';
	}
}

export default DonationAlertsSocket;