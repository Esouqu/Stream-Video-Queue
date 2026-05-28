import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";
import type { DonationAlertsUserData } from "./types";

class DonationAlertsApiClient extends ApiClient {
	public async getUser() {
		const { data, error } = await this.get<DonationAlertsUserData>('/donationalerts/user');

		if (error) {
			toast.error('Ошибка при получении DonationAlerts пользователя', {
				description: error.message
			});
		} else {
			return data;
		}
	}

	public async getSocketToken(userId: string, client: string) {
		const { data, error } = await this.post<{
			token: string;
			roomId: string;
		}>('/donationalerts/socket-token', {
			userId,
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

export default DonationAlertsApiClient;
