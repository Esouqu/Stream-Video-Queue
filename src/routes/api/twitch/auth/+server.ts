import { dev } from "$app/environment";
import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  const twitchScope = 'channel:manage:polls+channel:read:polls';
  const redirectUrl = dev ? 'http://localhost:5173/redirect/twitch' : 'https://stream-video-queue.vercel.app/redirect/twitch';
  const queryParams = `response_type=code&client_id=${PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${twitchScope}`;
  const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?${queryParams}`;

  throw redirect(302, twitchAuthUrl);
};