import { dev } from "$app/environment";
import { TWITCH_REFRESH_TOKEN, TWITCH_SECRET_KEY, TWITCH_SESSION } from "$env/static/private";
import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import type { IAuthTokenData } from "$lib/interfaces";
import { type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
  const refreshToken = cookies.get(TWITCH_REFRESH_TOKEN);

  console.log(`twitch refresh cookies: ${refreshToken}`);
  if (!refreshToken) return new Response('No refresh token is available', { status: 400 });

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
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
    }).then((res) => res);

    if (response.status === 400) {
      cookies.delete(TWITCH_SESSION, { path: '/' });
      cookies.delete(TWITCH_REFRESH_TOKEN, { path: '/' });

      location.reload();

      return new Response('Refresh token is invalid', { status: 400 })
    };
    console.log('twitch refresh response')
    console.log(response)
    const tokenData = await response.json().then((data: IAuthTokenData) => data);

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
    });

    return new Response(JSON.stringify(tokenData), { status: 200 });
  } catch (err: unknown) {
    const error = err as { response: { status: number } };

    if (error.response?.status === 401) {
      return new Response('The twitch refresh token is invalid', { status: error.response.status });
    } else {
      return new Response('Something went wrong', { status: 500 });
    }
  }
};