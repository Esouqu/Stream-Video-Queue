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

export function msToHHMMSS(ms: number) {
	const hour = Math.floor(ms / 3600000);
	const min = Math.floor((ms % 3600000) / 60000);
	const sec = Math.floor((ms % 60000) / 1000);

	return sec;
	// return [
	// 	String(hour).padStart(2, '0'),
	// 	String(min).padStart(2, '0'),
	// 	String(sec).padStart(2, '0')
	// ].join(':');
}

export function formatDate(date: Date) {
	const currentYear = new Date().getFullYear();
	const dateYear = date.getFullYear();

	return date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: dateYear === currentYear ? undefined : 'numeric',
	});
}

export function formatViews(views: number) {
	const formatter = new Intl.NumberFormat('ru', { notation: 'compact' });
	return `${formatter.format(views)}`;
}

export function formatNumberWithSuffix(number: number) {
	if (number === 0) return "0";

	const suffixes = ['', ' тыс.', ' млн', ' млрд'];
	const exp = Math.floor(Math.log10(number) / 3);
	const suffix = suffixes[exp];
	const num = number / 10 ** (exp * 3);

	const float = num.toFixed(0);
	return (float.endsWith('.0') ? num.toFixed(0) : float) + suffix;
}

type TimeInterval = {
	label: Intl.RelativeTimeFormatUnit;
	seconds: number;
}

export function timeAgo(date: string) {
	const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
	const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });

	const intervals: TimeInterval[] = [
		{ label: 'year', seconds: 31536000 },
		{ label: 'month', seconds: 2592000 },
		{ label: 'week', seconds: 604800 },
		{ label: 'day', seconds: 86400 },
		{ label: 'hour', seconds: 3600 },
		{ label: 'minute', seconds: 60 },
		{ label: 'second', seconds: 1 },
	];

	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) {
			return rtf.format(-count, interval.label);
		}
	}

	return rtf.format(0, 'second'); // "now"
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