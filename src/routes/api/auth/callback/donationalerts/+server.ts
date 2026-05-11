import { dev } from "$app/environment";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import { PUBLIC_DONATIONALERTS_CLIENT_ID } from "$env/static/public";
import { DONATIONALERTS_REFRESH_TOKEN_COOKIE, DONATIONALERTS_SECRET_KEY, DONATIONALERTS_TOKEN_COOKIE } from "$env/static/private";
import type { AuthTokenData } from "$lib/types";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const redirectUrl = dev ? 'http://localhost:5173/api/auth/callback/donationalerts' : 'https://stream-video-queue.vercel.app/api/auth/callback/donationalerts';
	const tokenUrl = 'https://www.donationalerts.com/oauth/token';

	if (!code) throw redirect(300, '/');

	const tokenData = await fetch(tokenUrl, {
		method: 'POST',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			'grant_type': 'authorization_code',
			'client_id': PUBLIC_DONATIONALERTS_CLIENT_ID,
			'client_secret': DONATIONALERTS_SECRET_KEY,
			'code': code,
			'redirect_uri': redirectUrl,
		})
	}).then((res) => res.json()).then((data: AuthTokenData) => data);

	cookies.set(DONATIONALERTS_TOKEN_COOKIE, tokenData.access_token, {
		path: '/',
		secure: !dev,
		expires: new Date(Date.now() + tokenData.expires_in)
	});
	cookies.set(DONATIONALERTS_REFRESH_TOKEN_COOKIE, tokenData.refresh_token, {
		path: '/',
		secure: !dev,
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	});

	throw redirect(301, '/');
};