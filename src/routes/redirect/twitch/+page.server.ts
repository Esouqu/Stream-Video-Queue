import { dev } from "$app/environment";
import { TWITCH_REFRESH_TOKEN, TWITCH_SECRET_KEY, TWITCH_SESSION } from "$env/static/private";
import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import type { IAuthTokenData } from "$lib/interfaces";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const redirectUrl = dev ? 'http://localhost:5173/redirect/twitch' : 'https://stream-video-queue.vercel.app/redirect/twitch';
  const tokenUrl = 'https://id.twitch.tv/oauth2/token';

  if (!code) throw redirect(300, '/');

  const tokenData = await fetch(tokenUrl, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: PUBLIC_TWITCH_CLIENT_ID,
      client_secret: TWITCH_SECRET_KEY,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUrl,
    })
  }).then((res) => res.json()).then((data: IAuthTokenData) => data);

  cookies.set(TWITCH_SESSION, tokenData.access_token, {
    path: '/',
    httpOnly: true,
    secure: !dev,
    expires: new Date(Date.now() + tokenData.expires_in * 1000)
  });

  cookies.set(TWITCH_REFRESH_TOKEN, tokenData.refresh_token, {
    path: '/',
    httpOnly: true,
    secure: !dev,
    expires: new Date(Date.now() + 30 * 1000 * 60 * 60 * 24),
  })

  throw redirect(301, '/');
};