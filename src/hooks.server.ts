// import { dev } from "$app/environment";
// import { TWITCH_REFRESH_TOKEN, TWITCH_SESSION } from "$env/static/private";
import type { HandleFetch } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  console.log(request.url)
  // const session = event.request.headers.get('cookie');

  // if (request.url.startsWith('https://api.my-domain.com/') && session) {
  //   request.headers.set('cookie', session);
  // }
  // console.log(event.request.headers.get('cookie'));
  return fetch(request);
}