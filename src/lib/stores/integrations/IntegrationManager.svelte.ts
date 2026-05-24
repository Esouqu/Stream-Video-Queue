import type { IntegrationId, SocketMessage } from "$lib/types";
import { SvelteMap } from "svelte/reactivity";
import type Integration from "./Integration.svelte";

class IntegrationManager {
	private _sockets = new SvelteMap<IntegrationId, Integration>();

	private _onMessage: (message: SocketMessage) => void;

	constructor(onMessage: (message: SocketMessage) => void) {
		this._onMessage = onMessage;
	}

	get sockets() { return Array.from(this._sockets.values()) }

	public toggle(id: IntegrationId, isToggled: boolean) {
		const socket = this._sockets.get(id);

		if (isToggled) {
			socket?.disconnect();
		} else {
			socket?.connect();
		}
	}

	public remove(integrationId: IntegrationId) {
		const socket = this._sockets.get(integrationId);
		socket?.disconnect();
		this._sockets.delete(integrationId);
	}

	public add(socket: Integration) {
		socket.onMessage(this._onMessage.bind(this));
		this._sockets.set(socket.id, socket);
	}
}

export default IntegrationManager;
