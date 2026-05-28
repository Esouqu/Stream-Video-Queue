import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";

class TwitchApiClient extends ApiClient {
	public async validateToken() {
		const { data, error } = await this.get<{ token: string }>('/twitch/validate');

		if (error) {
			console.error(error);
			// toast.error('Ошибка при валидации Twitch токена', {
			// 	description: error.message
			// });
		} else {
			return data;
		}
	}

	public async getUsername() {
		const { data, error } = await this.get<{ username: string }>('/twitch/user');

		if (error) {
			toast.error('Ошибка при получении Twitch канала', {
				description: error.message
			});
		} else {
			return data.username;
		}
	}
}

export default TwitchApiClient;