import { TWITCH_SESSION } from "$env/static/private";
import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import type { ITwitchUserData } from "$lib/interfaces";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const twitchSession = cookies.get(TWITCH_SESSION);

  if (!twitchSession) {
    return new Response('No Twitch session available', { status: 401 });
  }

  const response = await fetch('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${twitchSession}`,
      'Client-Id': PUBLIC_TWITCH_CLIENT_ID,
    },
  });

  const userData = (await response.json()) as { data: ITwitchUserData[] };

  return new Response(JSON.stringify(userData.data[0]), { status: 200 });
};
