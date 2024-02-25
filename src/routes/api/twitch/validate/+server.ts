import { TWITCH_REFRESH_TOKEN, TWITCH_SESSION } from "$env/static/private";
import type { ITwitchValidation } from "$lib/interfaces";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get(TWITCH_SESSION);
  const refreshToken = cookies.get(TWITCH_REFRESH_TOKEN);

  let validatedToken: ITwitchValidation | undefined;

  if (!session) return new Response('No twitch session available', { status: 401 });

  if (!session && refreshToken) {
    validatedToken = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    }).then((res) => res.json()).then((data: ITwitchValidation) => data);
  } else if (session) {
    validatedToken = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { 'Authorization': `Bearer ${session}` }
    }).then((res) => res.json()).then((data: ITwitchValidation) => data);
  }

  if (!validatedToken || validatedToken.status === 401) return new Response('No twitch session available', { status: 401 });

  return new Response(JSON.stringify(validatedToken), { status: 200 });
};