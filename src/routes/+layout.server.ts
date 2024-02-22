import { TWITCH_REFRESH_TOKEN, TWITCH_SESSION } from "$env/static/private";
import type { ITwitchUserData } from "$lib/interfaces";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  let twitchSession: string | undefined = cookies.get(TWITCH_SESSION);
  let twitchChannel: ITwitchUserData | undefined;

  await fetch('/api/twitch/validate').then((res) => res.status === 200);

  if (!twitchSession) {
    const response = await fetch('/api/twitch/refresh', { method: 'POST' });

    if (response.status === 200) {
      twitchSession = await response.json().then((data) => data.access_token);
    }
    if (response.status === 401) {
      cookies.delete(TWITCH_REFRESH_TOKEN, { path: '/' });
    }
  }

  if (twitchSession) {
    twitchChannel = await fetch('/api/twitch/user')
      .then((res) => res.json())
      .then((data: ITwitchUserData) => data);
  }

  return {
    twitchSession,
    twitchChannel
  }
};