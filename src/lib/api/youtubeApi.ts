import ApiClient from "$lib/utils/ApiClient";
import { toast } from "svelte-sonner";
import type { VideoData, VideoDataResponse } from "./types";
import { dev } from "$app/environment";
import { MOCK_VIDEO_DATA } from "$lib/constants";

class YoutubeApi extends ApiClient {
	public async getVideo(id: string) {
		if (dev) {
			return await new Promise<VideoData>((resolve) => {
				setTimeout(() => {
					resolve(MOCK_VIDEO_DATA)
				}, 200);
			});
		}

		const { data, error } = await this.get<VideoDataResponse>(`/youtube/video?id=${id}`, {
			customErrors: {
				400: `Некорректный ID видео: "${id}"`,
				401: 'Ошибка аутентификации YouTube API',
				403: 'Ошибка аутентификации YouTube API',
				404: `Видео с ID "${id}" не найдено`,
				429: 'Слишком много запросов. Пожалуйста, попробуйте позже.',
				500: 'YouTube API временно недоступен. Пожалуйста, попробуйте позже.',
				502: 'YouTube API временно недоступен. Пожалуйста, попробуйте позже.',
				503: 'YouTube API временно недоступен. Пожалуйста, попробуйте позже.',
			}
		});

		if (error) {
			toast.error('Не удалось получить YouTube видео', {
				description: error.message
			});
		} else {
			return data.items[0];
		}
	}
}

export default YoutubeApi;