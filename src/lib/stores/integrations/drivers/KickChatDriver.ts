import type { IConnectionDriver } from "$lib/interfaces";
import type { SocketMessage } from "$lib/types";

class KickChatDriver implements IConnectionDriver {
	private _socket: ReturnType<typeof createClient> | null = null;
	private onMsgCb?: (p: SocketMessage) => void;

	public async connect(config: { roomId: string }) {
		return new Promise<void>((resolve) => {
			this._socket = createClient(config.roomId, { logger: true, readOnly: true });

			this._socket.on('connected', () => resolve());
			this._socket.on('connected', () => resolve());
			this._socket.on('message', (message) => {
				console.log(message)
				// this.onMsgCb?.({
				// 	name: username,
				// 	message: message,
				// 	value: 0,
				// 	source: 'kick'
				// });
			});
		});

	}

	public disconnect() {
		// this._socket?.disconnect();
	}

	public onMessage(callback: (p: SocketMessage) => void) {
		this.onMsgCb = callback;
	}
}

export default KickChatDriver;
