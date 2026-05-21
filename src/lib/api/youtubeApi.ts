import type { VideoDataResponse } from "./types";

class YoutubeApi {
	public async getVideo(id: string) {
		const res = await fetch(`api/youtube/video?id=${id}`);

		if (!res.ok) {
			switch (res.status) {
				case 400:
					throw new Error(`Некорректный ID видео: "${id}"`);
				case 401:
				case 403:
					throw new Error('Ошибка аутентификации YouTube API');
				case 404:
					throw new Error(`Видео с ID "${id}" не найдено`);
				case 429:
					throw new Error('Слишком много запросов. Пожалуйста, попробуйте позже.');
				case 500:
				case 502:
				case 503:
					throw new Error('YouTube API временно недоступен. Пожалуйста, попробуйте позже.');
				default:
					throw new Error(`Непредвиденная ошибка (${res.status}) при получении видео`);
			}
		}

		const data: VideoDataResponse = await res.json();

		if (!data.items || data.items.length === 0) {
			throw new Error(`Видео с ID "${id}" не найдено`);
		}

		// console.log(data.items[0])
		return data.items[0];
	}
}

const youtubeApi = new YoutubeApi();

export default youtubeApi;