import type { MessageSource, SocketMessage, SocketState } from "$lib/types";
import { SvelteSet } from "svelte/reactivity";

type DonationHandler = (donation: SocketMessage) => void;

abstract class MessageSocket {
	protected _state = $state<SocketState>('closed');
	protected _donationListeners = new SvelteSet<DonationHandler>();

	readonly id: MessageSource;
	readonly color: string;

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

	constructor(id: MessageSource, color: string) {
		this.id = id;
		this.color = color;
	}

	public onMessage(handler: DonationHandler) {
		this._donationListeners.add(handler);
		return () => this._donationListeners.delete(handler);
	}

	public abstract connect(): Promise<void>;
	public abstract disconnect(): void;
}

export default MessageSocket;
