export function extractYoutubeVideoData(str: string): { videoId: string, timing?: number } | undefined {
  const videoIdRegex =
    /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/)|youtu\.be\/|\/video\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})?/;
  const videoIdMatch = str.match(videoIdRegex);

  if (!videoIdMatch || !videoIdMatch[1]) return;

  const timingRegex = /&t=(\d+)/;
  const timingMatch = str.match(timingRegex);
  console.log(timingMatch)

  if (!timingMatch || !timingMatch[1]) return { videoId: videoIdMatch[1] };

  return { videoId: videoIdMatch[1], timing: Number(timingMatch[1]) };
}

export function extractKeyword(str: string, keywords: string[]): string | undefined {
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