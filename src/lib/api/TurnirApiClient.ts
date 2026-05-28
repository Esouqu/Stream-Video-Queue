import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";

type TurnirRequestData = {
	channel: string;
	platform: string;
}

type TurnirResponseMessageData = {
	id: string;
	channel: string;
	message: string;
	user: {
		id: string;
		username: string;
	}
	ts: number;
}

class TurnirApiClient extends ApiClient {
	public async getMessages({ channel, platform }: TurnirRequestData) {
		const timestamp = Date.now();
		const { data, error } = await this.get<{ chat_messages: TurnirResponseMessageData[] }>(`/chat_messages?platform=${platform}&channel=${channel}&ts=${timestamp}`);

		if (error) {
			toast.error('Не удалось получить сообщения', { description: error.message });
		} else {
			return data;
		}
	}

	public async checkConnectionStatus({ channel, platform }: TurnirRequestData) {
		const { data, error } = await this.post<{ stream_status: string }>(`/chat_connect?channel=${channel}&platform=${platform}`);

		if (error) {
			toast.error('Не удалось подключиться к чату', { description: error.message });
		} else {
			return data;
		}
	}
}

export default TurnirApiClient;
