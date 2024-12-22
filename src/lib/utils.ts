import { browser } from "$app/environment";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function remToPx(rem: number) {
	if (!browser) return 0;
	return rem * parseFloat(getComputedStyle(document.body).fontSize);
}

export function getRandomIndex<T>(items: T[]) {
	return Math.floor(Math.random() * items.length);
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

export function extractKeyword(str: string, keywords: string[]): string | undefined {
	// special symbols like ':', ')' etc. are not supported
	const keywordsRegex = new RegExp("(?<![a-zA-Z]|[а-яА-Я])(" + keywords.join('|') + ")(?![a-zA-Z]|[а-яА-Я])", "i");
	const matchedKeywords = str.match(keywordsRegex);

	if (matchedKeywords && matchedKeywords[0]) return toSentenceCase(matchedKeywords[0]);
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function toSentenceCase(sentence: string): string {
	if (!sentence) return '';

	const firstLetter = sentence.charAt(0).toUpperCase();
	const restOfSentence = sentence.slice(1).toLowerCase();

	return firstLetter + restOfSentence;
}

export function getRandomInRange(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function insertRandomly<T>(items: T[], item: T) {
	const randomIdx = Math.floor(Math.random() * items.length);
	const firstHalf = items.slice(0, randomIdx);
	const secondHalf = items.slice(randomIdx);

	return [...firstHalf, item, ...secondHalf];
}

export function msToHHMMSS(ms: number) {
	const hour = Math.floor(ms / 3600000);
	const min = Math.floor((ms % 3600000) / 60000);
	const sec = Math.floor((ms % 60000) / 1000);

	return [
		String(hour).padStart(2, '0'),
		String(min).padStart(2, '0'),
		String(sec).padStart(2, '0')
	].join(':');
}

export function updateLocalStorageVersion(currentVersion: number) {
	if (!browser) return;

	const storedVersion = localStorage.getItem('version');
	const parsedVersion = parseInt(storedVersion || '0', 10);

	if (parsedVersion !== currentVersion) {
		localStorage.clear();
		localStorage.setItem('version', currentVersion.toString());
	}
}
