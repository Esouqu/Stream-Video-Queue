import type { DriverEvents } from "$lib/types";
import EventEmitter from "$lib/utils/EventEmitter";

abstract class SocketDriver extends EventEmitter<DriverEvents> {
	abstract connect(): Promise<void>;
	abstract disconnect(): void;
}

export default SocketDriver;
