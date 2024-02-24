import { dev } from "$app/environment";
import { DONATIONALERTS_REFRESH_TOKEN, DONATIONALERTS_SECRET_KEY, DONATIONALERTS_SESSION } from "$env/static/private";
import { PUBLIC_DONATIONALERTS_CLIENT_ID } from "$env/static/public";
import type { IDonationAlertsRefreshToken } from "$lib/interfaces";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
  const refreshToken = cookies.get(DONATIONALERTS_REFRESH_TOKEN);
  const scope = 'oauth-user-show oauth-donation-subscribe';

  if (!refreshToken) throw redirect(301, '/');

  try {
    const response = await fetch('https://www.donationalerts.com/oauth/token', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: PUBLIC_DONATIONALERTS_CLIENT_ID,
        client_secret: DONATIONALERTS_SECRET_KEY,
        refresh_token: refreshToken,
        scope,
      })
    }).then((res) => res.json()).then((data: IDonationAlertsRefreshToken) => data);

    cookies.set(DONATIONALERTS_SESSION, response.access_token, {
      path: '/',
      httpOnly: true,
      sameSite: "lax",
      secure: !dev,
      expires: new Date(Date.now() + response.expires_in)
    });

    if (response.refresh_token) {
      cookies.set(DONATIONALERTS_REFRESH_TOKEN, response.refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: !dev,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
    }

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err: unknown) {
    const error = err as { response: { status: number } };

    if (error.response?.status === 401) {
      cookies.delete(DONATIONALERTS_REFRESH_TOKEN, { path: '/' });
      return new Response('The donation alerts refresh token is invalid', { status: 401 });
    } else {
      return new Response('Something went wrong', { status: 500 });
    }
  }
};