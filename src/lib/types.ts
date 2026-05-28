import type { Component } from "svelte";
import type SocketDriver from "./socket-drivers/SocketDriver";

export type SkipAction = 'none' | 'warning' | 'skip';
export type IntegrationId = 'twitch' | 'kick' | 'donationalerts' | 'donatepay';
export type SocketState = 'not-exists' | 'connecting' | 'open' | 'closed';

export type IntegrationData = {
	id: IntegrationId;
	name: string;
	color: string;
	icon: Component;
	shouldHandleApiKey?: boolean;
};

export type IntegrationConfig = {
	data: IntegrationData;
	driver: SocketDriver;
}

export type DriverEvents = {
	message: SocketMessageData;
	connect: void;
	disconnect: void;
	error: Error;
}

export type SocketMessageData = {
	name: string;
	message: string;
	value: number;
	source: IntegrationId;
}

export type QueueItemData = {
	id: string;
	sortOrder: string;

	// video data
	videoId: string;
	startMs: number;
	durationMs?: number;
	isLive: boolean;
	title: string;
	channelTitle: string;
	thumbnail: string;
	viewCount: string;
	publishedAt: string;

	// additional data
	submittedBy: string;
	value: number;
	color: [number, number, number];
}

export type RawQueueItemData = Omit<QueueItemData, 'id' | 'sortOrder'>;

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