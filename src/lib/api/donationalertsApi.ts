import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";

class DonationAlertsApi extends ApiClient {
	public async getSocketToken(client: string): Promise<string | undefined> {
		const { data, error } = await this.post<{ token: string }>('/donationalerts/centrifuge-token', {
			client,
		});

		if (error) {
			toast.error('Ошибка при получении DonationAlerts сокет токена', {
				description: error.message
			});
		} else {
			return data.token;
		}
	}
}

export default DonationAlertsApi;
