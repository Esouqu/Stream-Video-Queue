import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";

class DonatePayApiClient extends ApiClient {
	public async getSocketToken() {
		const { data, error } = await this.get<{
			accessToken: string,
			socketAccessToken: string,
			roomId: string
		}>('/donatepay/socket-token');

		if (error) {
			toast.error('Не удалось получить DonatePay сокет токен', {
				description: error.message
			});
		} else {
			return data;
		}
	};
}

export default DonatePayApiClient;
