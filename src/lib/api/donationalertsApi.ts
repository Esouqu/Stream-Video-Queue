import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";
import type { DonationAlertsUserData } from "./types";

class DonationAlertsApi extends ApiClient {
	public async getUser() {
		const { data, error } = await this.get<DonationAlertsUserData>('/api/donationalerts/user');

		if (error) {
			toast.error('Ошибка при получении DonationAlerts пользователя', {
				description: error.message
			});
		} else {
			return data;
		}
	}

	public async getSocketToken(client: string) {
		const { data, error } = await this.post<{
			token: string;
			channel: string;
		}>('/donationalerts/socket-token', {
			client,
		});

		if (error) {
			toast.error('Ошибка при получении DonationAlerts сокет токена', {
				description: error.message
			});
		} else {
			return data;
		}
	}
}

export default DonationAlertsApi;
