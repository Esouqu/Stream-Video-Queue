type EventMap = Record<string, unknown>;

class EventEmitter<TEvents extends EventMap> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected _eventListeners: Map<keyof TEvents, ((data: any) => void)[]> = new Map();

	public on<K extends keyof TEvents>(event: K, callback: (data: TEvents[K]) => void): void {
		if (!this._eventListeners.has(event)) {
			this._eventListeners.set(event, []);
		}
		this._eventListeners.get(event)!.push(callback);
	}

	public off<K extends keyof TEvents>(event: K, callback: (data: TEvents[K]) => void): void {
		const listeners = this._eventListeners.get(event);
		if (listeners) {
			const index = listeners.indexOf(callback);
			if (index > -1) listeners.splice(index, 1);
		}
	}

	public emit<K extends keyof TEvents>(event: K, data?: TEvents[K]): void {
		const listeners = this._eventListeners.get(event);
		if (listeners) {
			listeners.forEach(callback => callback(data));
		}
	}
}

export default EventEmitter;
