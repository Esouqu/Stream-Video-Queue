import type { VideoData } from "./api/types";

export const SETTINGS_URL = '/?settings=open';

export const MOCK_VIDEO_DATA = {
	snippet: {
		channelTitle: 'Deko',
		title: 'iridescent prod. deko ✧･ﾟ: *✧･ﾟ:*  OFFICIAL VIDEO',
		publishedAt: '2019-07-20T01:40:57Z',
		categoryId: '22',
		liveBroadcastContent: 'none',
		defaultLanguage: 'en',
		defaultAudioLanguage: 'en',
		description: '',
		localized: {
			description: '',
			title: ''
		},
		tags: [],
		thumbnails: {
			default: {
				url: 'https://i.ytimg.com/vi/ssXR5K2ZdrM/mqdefault.jpg',
				width: 120,
				height: 90,
			},
			high: {
				url: 'https://i.ytimg.com/vi/ssXR5K2ZdrM/mqdefault.jpg',
				width: 480,
				height: 360,
			},
			medium: {
				url: 'https://i.ytimg.com/vi/ssXR5K2ZdrM/mqdefault.jpg',
				width: 320,
				height: 180,
			},
			maxres: {
				url: 'https://i.ytimg.com/vi/ssXR5K2ZdrM/mqdefault.jpg',
				width: 1920,
				height: 1080,
			},
			standard: {
				url: 'https://i.ytimg.com/vi/ssXR5K2ZdrM/mqdefault.jpg',
				width: 640,
				height: 480,
			}
		},
		channelId: 'UCmNqDj0e5Y9s1t2w2W8UZ6A',
	},
	etag: '',
	contentDetails: {
		caption: 'false',
		contentRating: {},
		licensedContent: false,
		projection: 'rectangular',
		definition: 'sd',
		dimension: '480x360',
		duration: 'PT1M40S',
	},
	id: 'ssXR5K2ZdrM',
	kind: 'youtube#video',
	statistics: {
		viewCount: '590151',
		likeCount: '0',
		commentCount: '0',
		favoriteCount: '0',
	}
} satisfies VideoData;