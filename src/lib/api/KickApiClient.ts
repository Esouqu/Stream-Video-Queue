import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";

class KickApiClient extends ApiClient {
	public async getUsername() {
		const { data, error } = await this.get<{ username: string }>('/kick/user');

		if (error) {
			toast.error('Ошибка при получении kick канала', {
				description: error.message
			});
		} else {
			return data;
		}
	}
}

export default KickApiClient;