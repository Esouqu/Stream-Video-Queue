import donationAlertsApi from "$lib/api/donationalertsApi";
import type { IConnectionDriver } from "$lib/interfaces";
import type { SocketMessage } from "$lib/types";

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

class DonationAlertsDriver implements IConnectionDriver {
	private _websocketUrl = 'wss://centrifugo.donationalerts.com/connection/websocket';

	private _socket: WebSocket | null = null;
	private onMessageCb?: (p: SocketMessage) => void;
	private onDisconnectCb?: () => void;
	private onErrorCb?: () => void;

	public async connect(config: { roomId: string; }) {
		const user = await donationAlertsApi.getUser();

		return new Promise<void>((resolve) => {
			if (!user?.socket_connection_token) return;

			this._socket = new WebSocket(this._websocketUrl);

			this._socket.addEventListener('open', () => {
				this._socket?.send(
					JSON.stringify({
						params: { token: user.socket_connection_token },
						id: 1
					})
				);

				resolve();
			});

			this._socket.addEventListener('message', async (event) => {
				const message = JSON.parse(event.data);

				if (message.id === 1) {
					const socketToken = await donationAlertsApi.getSocketToken(config.roomId, message.result.client);

					if (!socketToken) {
						throw new Error('No token received');
					}

					this._socket?.send(
						JSON.stringify({
							params: {
								channel: config.roomId,
								token: socketToken
							},
							method: 1,
							id: 2
						})
					);
				}

				if (!message.result.type && message.result.channel === config.roomId) {
					const donation: DonationAlertsMessage = message.result.data.data;
					const username = donation.username ?? 'Аноним';
					const amount = Math.round(donation.amount_in_user_currency);

					this.onMessageCb?.({
						name: username,
						value: amount,
						message: donation.message,
						source: 'donationalerts'
					});
				}
			});

			this._socket.addEventListener('close', () => {
				this.onDisconnectCb?.();
			});
			this._socket.addEventListener('error', () => {
				this.onErrorCb?.();
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

export default DonationAlertsDriver;