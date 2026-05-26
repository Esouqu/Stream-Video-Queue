import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";

class KickApiClient extends ApiClient {
	public async getChatroomId() {
		const { data, error } = await this.get<{
			kickAccountId: string,
			chatroomId: string
		}>('/kick/chatroomid');

		if (error) {
			toast.error('Ошибка при получении chatroomid', {
				description: error.message
			});
		} else {
			return data.chatroomId;
		}
	}
}

export default KickApiClient;