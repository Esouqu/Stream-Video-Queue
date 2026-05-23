import type { IntegrationId, IntegrationType, SocketMessage } from "$lib/types";
import { SvelteMap } from "svelte/reactivity";
import type Integration from "./Integration.svelte";

class IntegrationManager {
	private _sockets = new SvelteMap<IntegrationId, Integration>();
	readonly all = $derived(Array.from(this._sockets.values()));
	readonly chats = $derived(this.all.filter((s) => s.type === 'chat'));
	readonly donations = $derived(this.all.filter((s) => s.type === 'donation'));

	private _onMessage: (message: SocketMessage) => void;

	get isChatEnabled() {
		return this.chats.some((s) => s.isOpen);
	}

	get isChatConnecting() {
		return this.chats.some((s) => s.isConnecting);
	}

	get isDonationEnabled() {
		return this.donations.some((s) => s.isOpen);
	}

	get isDonationsConnecting() {
		return this.donations.some((s) => s.isConnecting);
	}

	constructor(onMessage: (message: SocketMessage) => void) {
		this._onMessage = onMessage;
	}

	public toggle(isToggled: boolean, type: IntegrationType) {
		if (isToggled) {
			this._manage(type, 'connect');
		} else {
			this._manage(type, 'disconnect');
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

	private _manage(type: IntegrationType, action: 'connect' | 'disconnect') {
		const typeToSource: Record<typeof type, IntegrationId[]> = {
			chat: ['twitch', 'kick'],
			donation: ['donatepay', 'donationalerts'],
		}

		for (const socket of this._sockets) {
			if (typeToSource[type].includes(socket[0])) {
				if (action === 'connect') {
					socket[1].connect();
				} else {
					socket[1].disconnect();
				}
			}
		}
	}
}

export default IntegrationManager;
