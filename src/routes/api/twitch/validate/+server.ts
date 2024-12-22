import { TWITCH_REFRESH_TOKEN, TWITCH_SESSION } from "$env/static/private";
import type { ITwitchValidation } from "$lib/interfaces";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const twitchSession = cookies.get(TWITCH_SESSION);
  const twitchRefreshToken = cookies.get(TWITCH_REFRESH_TOKEN);

  if (!twitchSession && !twitchRefreshToken) {
    return new Response('No Twitch session or refresh token available', { status: 401 });
  }

  const response = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: { Authorization: `Bearer ${twitchSession || twitchRefreshToken}` },
  });

  if (!response.ok) {
    return new Response('Twitch session or refresh token is invalid', { status: 401 });
  }

  const validatedToken: ITwitchValidation = await response.json();

  return new Response(JSON.stringify(validatedToken), { status: 200 });
};
