import type { MessageSource, SocketMessage, SocketState } from "$lib/types";
import { SvelteSet } from "svelte/reactivity";

type MessageHandler = (donation: SocketMessage) => void;

abstract class MessageSocket {
	protected _state = $state<SocketState>('closed');
	protected _roomId = $state('');
	protected _messageListeners = new SvelteSet<MessageHandler>();

	readonly id: MessageSource;
	readonly color: string;

	get state() {
		return this._state;
	}

	get roomId() {
		return this._roomId;
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

	constructor(id: MessageSource, color: string, roomId?: string) {
		this.id = id;
		this.color = color;
		this._roomId = roomId || '';
	}

	public onMessage(handler: MessageHandler) {
		this._messageListeners.add(handler);
		return () => this._messageListeners.delete(handler);
	}

	public abstract connect(): Promise<void>;
	public abstract disconnect(): void;
}

export default MessageSocket;
