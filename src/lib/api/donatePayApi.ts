import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";

class DonatePayApi extends ApiClient {
	public async getSocketToken() {
		const { data, error } = await this.get<{ token: string }>('/donatepay/socket-token');

		if (error) {
			toast.error('Не удалось получить DonatePay сокет токен', {
				description: error.message
			});
		} else {
			return data.token;
		}
	};
}

export default DonatePayApi;
