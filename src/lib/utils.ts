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

export function extractYoutubeVideoData(str: string) {
	// Matches standard, shorts, embed, mobile, and youtu.be links
	const videoIdRegex = /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/|live\/))([a-zA-Z0-9_-]{11})/;
	const videoIdMatch = str.match(videoIdRegex);

	if (!videoIdMatch) return null;
	const videoId = videoIdMatch[1];

	// Matches t=123, t=1h2m3s, start=123, etc.
	const timingRegex = /[?&](?:t|start)=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?(\d+)?/;
	const timingMatch = str.match(timingRegex);

	let startSeconds = 0;

	if (timingMatch) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, hours, minutes, seconds, rawSeconds] = timingMatch;

		if (rawSeconds) {
			// Handles pure digit timestamps like t=123
			startSeconds = Number(rawSeconds);
		} else {
			// Handles formatted timestamps like t=1h30m20s
			startSeconds =
				(hours ? Number(hours) * 3600 : 0) +
				(minutes ? Number(minutes) * 60 : 0) +
				(seconds ? Number(seconds) : 0);
		}
	}

	return { videoId, startSeconds };
}

export function formatYoutubeDurationToMs(duration: string): number {
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

	if (!match) return 0;

	const hours = parseInt(match[1]) || 0;
	const minutes = parseInt(match[2]) || 0;
	const seconds = parseInt(match[3]) || 0;

	const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

	return totalSeconds * 1000;
}
