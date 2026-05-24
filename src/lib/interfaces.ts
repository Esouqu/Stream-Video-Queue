import type { SocketMessage } from "./types";

export interface IConnectionDriver {
	connect(): Promise<void>;
	disconnect(): void;
	onMessage?(callback: (payload: SocketMessage) => void): void;
	onDisconnect?(callback: () => void): void;
	onError?(callback: () => void): void;
}