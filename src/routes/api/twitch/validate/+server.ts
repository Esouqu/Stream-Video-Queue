import { auth } from "$lib/server/auth";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request, fetch }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Не авторизован' }, { status: 401 });
	}

	const tokenRes = await auth.api.getAccessToken({
		body: { providerId: "twitch" },
		headers: request.headers
	});

	if (!tokenRes?.accessToken) {
		return json({ error: 'Twitch токен не найден' }, { status: 400 });
	}

	try {
		const response = await fetch('https://id.twitch.tv/oauth2/validate', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${tokenRes.accessToken}`,
			}
		});

		if (response.status === 401) {
			console.error('Token expired or invalid! Refresh needed.');
			return json({ error: 'Действие Twitch токена истекло' }, { status: 401 });
		}

		return json(await response.json(), { status: response.status });

	} catch (err) {
		console.error("Twitch Sync Error:", err);
		return json({ error: "Что-то пошло не так" }, { status: 500 });
	}
};
