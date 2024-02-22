import { TWITCH_SESSION } from "$env/static/private";
import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import type { ITwitchUserData } from "$lib/interfaces";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get(TWITCH_SESSION);

  if (!session) return new Response('No twitch session available', { status: 401 });

  const user = await fetch('https://api.twitch.tv/helix/users', {
    headers: { 'Authorization': `Bearer ${session}`, 'Client-Id': PUBLIC_TWITCH_CLIENT_ID }
  }).then((res) => res.json()).then((data: { data: ITwitchUserData[] }) => data.data);

  return new Response(JSON.stringify(user[0]), { status: 200 });
};