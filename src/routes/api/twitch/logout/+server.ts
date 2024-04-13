import { TWITCH_REFRESH_TOKEN, TWITCH_SESSION } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete(TWITCH_SESSION, { path: '/' });
  cookies.delete(TWITCH_REFRESH_TOKEN, { path: '/' });

  return new Response('OK', { status: 200 });
};