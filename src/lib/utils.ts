export function findYoutubeVideoId(str: string): string | undefined {
  const videoIdRegex =
    /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/)|youtu\.be\/|\/video\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})?/;
  // const videoIdRegex =
  //   /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/|v\/)|youtu\.be\/|\/video\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})(?:&t=[0-9msh]*)?/;
  // const videoIdRegex =
  // /(?:youtube\.com\/(?:[^/\n\s]+\/(?:shorts?|watch)|(?:v|e(?:mbed)?)\/|\?v=|&v=)|youtu\.be\/|\/video\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11})/;
  const videoIdMatch = str.match(videoIdRegex);

  if (videoIdMatch && videoIdMatch[1]) return videoIdMatch[1];
}

export function findKeyword(str: string, keywords: string[]): string | undefined {
  const keywordsRegex = new RegExp("(" + keywords.join("|") + ")", "ig");
  const extractedKeywords = str.match(keywordsRegex);

  if (extractedKeywords && extractedKeywords[0]) return extractedKeywords[0];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}