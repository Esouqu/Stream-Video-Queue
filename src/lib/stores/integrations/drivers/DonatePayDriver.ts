import donatePayApi from "$lib/api/donatePayApi.svelte";
import type { IConnectionDriver } from "$lib/interfaces";
import type { SocketMessage } from "$lib/types";
import Centrifuge from "centrifuge";

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

class DonatePayDriver implements IConnectionDriver {
	private _CENTRIFUGO_URL = 'wss://centrifugo.donatepay.ru:443/connection/websocket';
	private _TOKEN_ENDPOINT = 'https://donatepay.ru/api/v2/socket/token';

	private _socket: Centrifuge | null = null;
	private onMsgCb?: (p: SocketMessage) => void;

	public async connect(config: { roomId: string; token?: string }) {
		const data = await donatePayApi.getToken();

		return new Promise<void>((resolve) => {
			if (!data.apiKey || !data.token)
				throw new Error('Не удалось установить соединение.\nПопробуйте обновить DonatePay API ключ.');

			this._socket = new Centrifuge(this._CENTRIFUGO_URL, {
				subscribeEndpoint: this._TOKEN_ENDPOINT,
				subscribeParams: { access_token: data.apiKey },
				refreshEndpoint: this._TOKEN_ENDPOINT,
				refreshParams: { access_token: data.apiKey },
				disableWithCredentials: true,
			});

			this._socket.setToken(data.token);

			this._socket.subscribe(config.roomId, (message) => {
				const { data } = message as DonatePayDonationMessage;
				const username = data.notification.vars.name ?? 'Аноним';
				const amount = Math.round(data.notification.vars.sum);


				this.onMsgCb?.({
					name: username,
					value: amount,
					message: data.notification.vars.comment,
					source: 'donatepay'
				});
			});

			this._socket.on('connect', () => resolve());

			this._socket.on('error', (error) => {
				console.error('Centrifuge error:', error);
			});

			this._socket.connect();
		});
	};

	public disconnect() {
		if (this._socket) this._socket.disconnect();
	}

	public onMessage(callback: (p: SocketMessage) => void) {
		this.onMsgCb = callback;
	}
}

export default DonatePayDriver;