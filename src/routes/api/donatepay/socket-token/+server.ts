import { auth } from "$lib/server/auth";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ fetch, request }) => {
	const accessToken = await auth.api.getAccessToken({
		body: {
			providerId: "donatepay",
		},
		headers: request.headers
	});
	if (!accessToken) throw redirect(302, "/");

	const TOKEN_ENDPOINT = 'https://donatepay.ru/api/v2/socket/token';

	try {
		const response = await fetch(TOKEN_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ access_token: accessToken })
		});
		const data = await response.json();

		return new Response(JSON.stringify({ token: data.token }), { status: 200 });
	} catch (error) {
		console.error('Error fetching Centrifuge token:', error);
		return new Response('Что-то пошло не так', { status: 500 });
	}
};