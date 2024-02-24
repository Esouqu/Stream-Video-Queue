import { dev } from "$app/environment";
import { TWITCH_REFRESH_TOKEN, TWITCH_SECRET_KEY, TWITCH_SESSION } from "$env/static/private";
import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import type { IAuthTokenData } from "$lib/interfaces";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
  const refreshToken = cookies.get(TWITCH_REFRESH_TOKEN);

  if (!refreshToken) throw redirect(301, '/');

  try {
    const tokenData = await fetch('https://id.twitch.tv/oauth2/token', {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: PUBLIC_TWITCH_CLIENT_ID,
        client_secret: TWITCH_SECRET_KEY,
        refresh_token: refreshToken
      })
    }).then((res) => res.json()).then((data: IAuthTokenData) => data)

    cookies.set(TWITCH_SESSION, tokenData.access_token, {
      path: '/',
      httpOnly: true,
      sameSite: "lax",
      secure: !dev,
      expires: new Date(Date.now() + tokenData.expires_in * 1000)
    });
    cookies.set(TWITCH_REFRESH_TOKEN, tokenData.refresh_token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: !dev,
      expires: new Date(Date.now() + 30 * 1000 * 60 * 60 * 24),
    })

    return new Response(JSON.stringify(tokenData), { status: 200 });
  } catch (err: unknown) {
    const error = err as { response: { status: number } };

    if (error.response?.status === 401) {
      cookies.delete(TWITCH_REFRESH_TOKEN, { path: '/' });
      return new Response('The twitch refresh token is invalid', { status: 401 });
    } else {
      return new Response('Something went wrong', { status: 500 });
    }
  }
};