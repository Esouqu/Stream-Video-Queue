import type { IntegrationData, IntegrationId, SocketMessage, SocketState } from "$lib/types";
import { toast } from "svelte-sonner";
import { SvelteSet } from "svelte/reactivity";
import type { Component } from "svelte";
import type { IConnectionDriver } from "$lib/interfaces";

type MessageHandler = (message: SocketMessage) => void;

class Integration {
	readonly id: IntegrationId;
	readonly name: string;
	readonly color: string;
	readonly icon: Component;
	readonly onAuth?: () => void;
	readonly onLogout?: () => void;

	private _state = $state<SocketState>('not-exists');
	protected _messageListeners = new SvelteSet<MessageHandler>();

	protected driver: IConnectionDriver;

	constructor(data: IntegrationData, driver: IConnectionDriver) {
		this.id = data.id;
		this.name = data.name;
		this.color = data.color;
		this.icon = data.icon;

		this.driver = driver;

		this.driver.onMessage((msg) => {
			for (const handler of this._messageListeners) {
				handler(msg);
			}
		});
	}

	get state() {
		return this._state;
	}

	get isOpen() {
		return this._state === 'open';
	}

	get isConnecting() {
		return this._state === 'connecting';
	}

	get isClosed() {
		return this._state === 'closed';
	}

	public logout() {
		this.onLogout?.();
	}

	public auth() {
		this.onAuth?.();
	}

	public onMessage(handler: MessageHandler) {
		this._messageListeners.add(handler);
		return () => this._messageListeners.delete(handler);
	}

	public async connect() {
		this._state = 'connecting';

		try {
			await this.driver.connect();
			this._state = 'open';
			toast.info(`Соединение установлено — ${this.id}.`);
		} catch {
			this.disconnect();
		}
	}

	public disconnect() {
		this.driver.disconnect();
		this._state = 'closed';
		toast.error(`Соединение разорвано — ${this.id}.`);
	}
}

export default Integration;
