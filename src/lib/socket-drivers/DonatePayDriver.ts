import Centrifuge from "centrifuge";
import G from '$lib/stores/G.svelte';
import SocketDriver from "./SocketDriver";

type DonatePayDonationMessage = {
	data: {
		notification: {
			id: number;
			user_id: number;
			type: 'donation';
			view: null;
			vars: {
				name: string;
				comment: string;
				sum: number;
				currency: string;
			};
			created_at: string;
		};
	};
}

class DonatePayDriver extends SocketDriver {
	private _CENTRIFUGO_URL = 'wss://centrifugo.donatepay.ru:443/connection/websocket';
	private _TOKEN_ENDPOINT = 'https://donatepay.ru/api/v2/socket/token';

	private _socket: Centrifuge | null = null;

	public async connect() {
		const data = await G.donatepayApi.getSocketToken();
		if (!data) return;

		return new Promise<void>((resolve) => {

			this._socket = new Centrifuge(this._CENTRIFUGO_URL, {
				subscribeEndpoint: this._TOKEN_ENDPOINT,
				subscribeParams: { access_token: data.accessToken },
				refreshEndpoint: this._TOKEN_ENDPOINT,
				refreshParams: { access_token: data.accessToken },
				disableWithCredentials: true,
			});

			this._socket.setToken(data.socketAccessToken);

			this._socket.subscribe(data.roomId, (message) => {
				const { data } = message as DonatePayDonationMessage;
				const username = data.notification.vars.name ?? 'Аноним';
				const amount = Math.round(data.notification.vars.sum);

				this.emit('message', {
					name: username,
					value: amount,
					message: data.notification.vars.comment,
					source: 'donatepay'
				});
			});

			this._socket.on('connect', () => {
				this.emit('connect');
				resolve();
			});

			this._socket.on('error', (error) => {
				this.emit('error', error);
				console.error('Centrifuge error:', error);
			});

			this._socket.connect();
		});
	};

	public disconnect() {
		if (this._socket) this._socket.disconnect();
	}
}

export default DonatePayDriver;