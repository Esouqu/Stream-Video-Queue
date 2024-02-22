import { TWITCH_SESSION } from "$env/static/private";
import type { IAuthTokenData } from "$lib/interfaces";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get(TWITCH_SESSION);

  if (!session) return new Response('No twitch session available', { status: 401 });

  const validatedToken = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: { 'Authorization': `Bearer ${session}` }
  }).then((res) => res.json()).then((data: IAuthTokenData) => data);

  return new Response(JSON.stringify(validatedToken), { status: 200 });
};