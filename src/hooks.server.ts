// import { dev } from "$app/environment";
// import { TWITCH_REFRESH_TOKEN, TWITCH_SESSION } from "$env/static/private";
import type { HandleFetch } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  const cookies = event.request.headers.get('cookie');

  if (request.url.startsWith('https://stream-video-queue.vercel.app/') && cookies) {
    request.headers.set('cookie', cookies);
  }

  return fetch(request);
}