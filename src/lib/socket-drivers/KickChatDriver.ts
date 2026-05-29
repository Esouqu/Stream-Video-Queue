import type { TurnirResponseMessageData } from "$lib/api/types";
import G from "$lib/stores/G.svelte";
import type { SocketMessageData } from "$lib/types";
import SocketDriver from "./SocketDriver";

type QueueItem = {
	message: SocketMessageData;
	emitAtTime: number;
}

class KickChatDriver extends SocketDriver {
	private _server = 'kick';
	private _channel = '';
	private _startTimeTs = Date.now();
	private _lastMessageTs: number | null = null;

	private _emissionQueue: QueueItem[] = [];
	private _isProcessingQueue = false;
	private _serverToLocalTimeOffset = 0;

	private _connectionCounter = 0;
	private _maxConnectionRetries = 3;

	private _pollIntervalId: number | null = null;
	private _retryTimeoutId: number | null = null;
	private _queueTimeoutId: number | null = null;

	private _abortController: AbortController | null = null;
	private _seenMessageIds = new Set<string>();

	public async connect() {
		if (this._pollIntervalId) return;

		this._clearTimers();

		const kickData = await G.kickApi.getUsername();
		if (!kickData) return;

		this._channel = kickData.username.toLowerCase();

		if (this._channel) await this._connectionFetch();
	}

	public disconnect() {
		this._clearTimers();

		if (this._abortController) {
			this._abortController.abort();
			this._abortController = null;
		}

		this._seenMessageIds.clear();
		this._emissionQueue = [];
		this._lastMessageTs = null;
		this._connectionCounter = 0;
		this._isProcessingQueue = false;
	}

	private async _connectionFetch() {
		const statusData = await G.turnirApi.checkConnectionStatus({
			channel: this._channel,
			platform: this._server
		});
		if (!statusData)
			throw new Error('Не удалось получить данные о соединении.');

		if (statusData.stream_status === 'connected') {
			this._connectionCounter = 0;

			await this._fetchTick();
			this._pollIntervalId = window.setInterval(() => {
				this._fetchTick();
			}, 3000);

			return;
		}

		if (statusData.stream_status === 'disconnected') {
			if (this._connectionCounter >= this._maxConnectionRetries) {
				throw new Error(`Превышено максимальное количество попыток соединения.`);
			}

			this._connectionCounter++;

			return new Promise<void>((resolve, reject) => {
				this._retryTimeoutId = window.setTimeout(async () => {
					try {
						await this._connectionFetch();
						resolve();
					} catch (error) {
						reject(error);
					}
				}, 3000);
			});
		}
	}

	private async _fetchTick() {
		if (this._abortController) {
			this._abortController.abort();
		}
		this._abortController = new AbortController();

		const currentCursorTs = this._lastMessageTs ?? this._startTimeTs;
		const fetchBufferTs = currentCursorTs - 5 * 1000;

		const data = await G.turnirApi.getMessages({
			channel: this._channel,
			platform: this._server,
			ts: fetchBufferTs
		});

		if (data) {
			this._queueIncomingMessages(data.chat_messages);
		} else {
			this.disconnect();
		}
	}

	private _queueIncomingMessages(rawMessages: TurnirResponseMessageData[]) {
		if (rawMessages.length === 0) return;

		const localNow = Date.now();
		const sortedMessages = [...rawMessages].sort((a, b) => a.ts - b.ts);
		const newestServerMsg = sortedMessages[sortedMessages.length - 1];
		this._serverToLocalTimeOffset = localNow - newestServerMsg.ts;

		for (const msg of sortedMessages) {
			if (this._seenMessageIds.has(msg.id)) continue;
			this._seenMessageIds.add(msg.id);

			if (!this._lastMessageTs || msg.ts > this._lastMessageTs) {
				this._lastMessageTs = msg.ts;
			}

			const messageWithSource: SocketMessageData = {
				name: msg.user.username,
				message: msg.message,
				value: 0,
				source: 'kick'
			}

			let targetEmitTime = msg.ts + this._serverToLocalTimeOffset;

			if (targetEmitTime < localNow) {
				targetEmitTime = localNow;
			}

			this._emissionQueue.push({
				message: messageWithSource,
				emitAtTime: targetEmitTime
			});
		}

		if (!this._isProcessingQueue && this._emissionQueue.length > 0) {
			this._processQueueLoop();
		}
	}

	private _processQueueLoop() {
		if (this._emissionQueue.length === 0) {
			this._isProcessingQueue = false;
			return;
		}

		this._isProcessingQueue = true;

		const localNow = Date.now();

		while (this._emissionQueue.length > 0 && this._emissionQueue[0].emitAtTime <= localNow) {
			const item = this._emissionQueue.shift();

			if (item) {
				this.emit('message', item.message);
			}
		}

		if (this._emissionQueue.length > 0) {
			const nextItem = this._emissionQueue[0];
			const delayNeeded = Math.max(0, nextItem.emitAtTime - Date.now());

			this._queueTimeoutId = window.setTimeout(() => {
				this._processQueueLoop();
			}, delayNeeded);
		} else {
			this._isProcessingQueue = false;
		}
	}

	private _clearTimers() {
		if (this._pollIntervalId) clearInterval(this._pollIntervalId)
		if (this._retryTimeoutId) clearTimeout(this._retryTimeoutId)
		if (this._queueTimeoutId) clearTimeout(this._queueTimeoutId)
		this._pollIntervalId = null
		this._retryTimeoutId = null
		this._queueTimeoutId = null
	}
}

export default KickChatDriver;
