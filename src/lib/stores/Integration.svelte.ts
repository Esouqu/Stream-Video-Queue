import type { IntegrationConfig, IntegrationData, SocketMessage, SocketState } from "$lib/types";
import EventEmitter from "$lib/utils/EventEmitter";
import { toast } from "svelte-sonner";
import type SocketDriver from "../socket-drivers/SocketDriver";

type IntegrationEvents = {
	message: SocketMessage;
	connect: void;
	disconnect: void;
}

class Integration extends EventEmitter<IntegrationEvents> {
	readonly data: IntegrationData;
	private _driver: SocketDriver;

	private _state = $state<SocketState>('not-exists');

	get state() { return this._state; }
	get isOpen() { return this._state === 'open'; }
	get isConnecting() { return this._state === 'connecting'; }
	get isClosed() { return this._state === 'closed'; }

	constructor(config: IntegrationConfig) {
		super();

		this.data = config.data;
		this._driver = config.driver;

		this._driver.on('message', (message) => {
			this._onMessage(message);
		});

		this._driver.on('disconnect', () => {
			this._onDisconnect();
		});

		this._driver.on('error', () => {
			this._onDisconnect();
		});
	}

	public async connect() {
		if (this._state === 'open' || this._state === 'connecting') return;
		this._state = 'connecting';

		try {
			await this._driver.connect();

			if (this._state !== 'connecting') return;
			this._state = 'open';

			toast.info(`Соединение с ${this.data.name} установлено.`);
		} catch (err) {
			this.disconnect();
			toast.error(`Не удалось установить соединение с ${this.data.name}`, {
				description: (err as Error).message
			});
		}
	}

	public disconnect() {
		this._driver.disconnect();
		this._state = 'closed';
		toast.error(`Соединение разорвано — ${this.data.id}.`);
	}

	private _onMessage(message: SocketMessage) {
		this.emit('message', message);
	}

	private _onDisconnect() {
		if (this._state !== 'closed') {
			this._state = 'closed';
			this.emit('disconnect');
			toast.error(`Соединение потеряно — ${this.data.id}.`);
		}
	}
}

export default Integration;
