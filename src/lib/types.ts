export type RGB = {
	r: number;
	g: number;
	b: number;
}

export type MessageSource = 'twitch' | 'kick' | 'donationalerts' | 'donatepay';
export type SocketState = 'not-exists' | 'connecting' | 'open' | 'closed';

export type SocketConnectionData = {
	roomId: string | number;
	socketToken?: string;
}

export type SocketMessage = {
	name: string;
	message: string;
	value: number;
	source: MessageSource;
}

export type QueueItemData = {
	id: number;
	// video data
	videoId: string;
	startSeconds: number;
	duration?: string;
	isLive: boolean;
	title: string;
	channelTitle: string;
	thumbnail: string;
	viewCount: string;
	publishedAt: string;
	// additional data
	submittedBy: string[];
	message: string;
	value: number;
	sortOrder: number;
	isActive: boolean;
	// source: MessageSource;
	color: number[];
}

export type PlayerOptions = {
	containerId: string;
	videoId: string;
	autoplay?: boolean;
	muted?: boolean;
	width?: number;
	height?: number;
}

export type PlayerState = {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
}

export type AuthTokenData = {
	token_type: string;
	expires_in: number;
	access_token: string;
	refresh_token: string;
}