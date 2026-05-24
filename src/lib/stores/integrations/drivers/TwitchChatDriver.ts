import { authClient } from "$lib/auth-client";
import type { IConnectionDriver } from "$lib/interfaces";
import type { SocketMessage } from "$lib/types";
import { toast } from "svelte-sonner";
import tmi from 'tmi.js';

class TwitchChatDriver implements IConnectionDriver {
	private _socket: tmi.Client | null = null;
	private onMessageCb?: (p: SocketMessage) => void;
	private onDisconnectCb?: () => void;

	public async connect() {
		try {
			const accounts = await authClient.listAccounts();
			const twitchAccount = accounts.data?.find((acc) => acc.providerId === 'twitch');

			if (!twitchAccount) {
				throw new Error('Twitch аккаунт не найден');
			}

			return new Promise<void>((resolve) => {
				this._socket = new tmi.Client({ channels: [twitchAccount.accountId] });

				this._socket.on('disconnected', () => {
					this.onDisconnectCb?.();
				});
				this._socket.on('connected', () => resolve());
				this._socket.on('message', (_, tags, message) => {
					const username = tags['display-name'] || tags.username || '???';

					this.onMessageCb?.({
						name: username,
						message: message,
						value: 0,
						source: 'twitch'
					});
				});

				this._socket.connect();
			});
		} catch {
			toast.error('Не авторизован или не подключен Twitch аккаунт');
		}

	}

	public disconnect(): void {
		this._socket?.disconnect();
	}

	public onMessage(callback: (p: SocketMessage) => void) {
		this.onMessageCb = callback;
	}

	public onDisconnect(callback: () => void): void {
		this.onDisconnectCb = callback;
	}
}

export default TwitchChatDriver;
