import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";
import type { TurnirResponseMessageData } from "./types";

type TurnirRequestData = {
	channel: string;
	platform: string;
	ts?: number;
}

class TurnirApiClient extends ApiClient {
	public async getMessages({ channel, platform, ts }: TurnirRequestData) {
		const { data, error } = await this.get<{
			chat_messages: TurnirResponseMessageData[]
		}>(`/chat_messages?platform=${platform}&channel=${channel}&ts=${ts}`);

		if (error) {
			toast.error('Не удалось получить сообщения', {
				description: error.message
			});
		} else {
			return data;
		}
	}

	public async checkConnectionStatus({ channel, platform }: TurnirRequestData) {
		const { data, error } = await this.post<{ stream_status: string }>(`/chat_connect?channel=${channel}&platform=${platform}`);

		if (error) {
			toast.error('Не удалось подключиться к чату', {
				description: error.message
			});
		} else {
			return data;
		}
	}
}

export default TurnirApiClient;
