type ThumbnailData = {
	url: string;
	width: number;
	height: number;
}

type ContentDetails = {
	duration?: string;
	dimension: string;
	definition: string;
	caption: string;
	licensedContent: boolean;
	contentRating: object;
	projection: string;
}

type VideoStatistics = {
	viewCount: string;
	likeCount: string;
	favoriteCount: string;
	commentCount: string;
}

type VideoSnippet = {
	publishedAt: string;
	channelId: string;
	title: string;
	description: string;
	thumbnails: {
		default: ThumbnailData;
		medium: ThumbnailData;
		high: ThumbnailData;
		standard: ThumbnailData;
		maxres: ThumbnailData;
	};
	channelTitle: string;
	tags: string[];
	categoryId: string;
	liveBroadcastContent: string;
	defaultLanguage: string;
	localized: {
		title: string;
		description: string;
	};
	defaultAudioLanguage: string;
}

export type VideoData = {
	kind: string;
	etag: string;
	id: string;
	snippet: VideoSnippet;
	contentDetails: ContentDetails;
	statistics: VideoStatistics;
}

export type VideoDataResponse = {
	kind: string;
	etag: string;
	items: VideoData[];
	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};
}

export type DefaultUserData = {
	id: number;
	name: string;
	avatar: string;
}

export type DonatePayUserData = DefaultUserData & {
	balance: number;
	cashout_sum: number;
}

export type DonationAlertsUserData = DefaultUserData & {
	code: string;
	is_active: number;
	email: string | null;
	language: string;
	socket_connection_token: string;
}

export type TurnirResponseMessageData = {
	id: string;
	channel: string;
	message: string;
	user: {
		id: string;
		username: string;
	}
	ts: number;
}