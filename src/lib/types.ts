import type { Component } from "svelte";

export type IntegrationId = 'twitch' | 'kick' | 'donationalerts' | 'donatepay';
export type SocketState = 'not-exists' | 'connecting' | 'open' | 'closed';

export type IntegrationData = {
	id: IntegrationId;
	name: string;
	color: string;
	icon: Component;
	isManual: boolean;
}

export type SocketMessage = {
	name: string;
	message: string;
	value: number;
	source: IntegrationId;
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