import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function extractYoutubeVideoData(str: string): { videoId: string, startSeconds: number } | undefined {
	const videoIdRegex =
		/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/)|youtu\.be\/|\/video\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})?/;
	const videoIdMatch = str.match(videoIdRegex);

	if (!videoIdMatch || !videoIdMatch[1]) return;

	const timingRegex = /&t=(\d+)/;
	const timingMatch = str.match(timingRegex);
	const startSeconds = timingMatch ? Number(timingMatch[1]) : 0;

	return { videoId: videoIdMatch[1], startSeconds };
}

export function toSentenceCase(sentence: string): string {
	if (!sentence) return '';

	const firstLetter = sentence.charAt(0).toUpperCase();
	const restOfSentence = sentence.slice(1).toLowerCase();

	return firstLetter + restOfSentence;
}

export function formatYoutubeDuration(duration: string) {
	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

	if (!match) throw new Error('Invalid duration format');

	const hours = parseInt(match[1]) || 0;
	const minutes = parseInt(match[2]) || 0;
	const seconds = parseInt(match[3]) || 0;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}