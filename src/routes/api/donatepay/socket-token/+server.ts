import { auth } from "$lib/server/auth";
import { fetchProviderAccountId } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ fetch, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Не авторизован' }, { status: 401 });
	}

	const tokenRes = await auth.api.getAccessToken({
		body: { providerId: "donatepay" },
		headers: request.headers
	});

	if (!tokenRes?.accessToken) {
		return json({ error: 'DonatePay токен не найден' }, { status: 400 });
	}

	const accountId = await fetchProviderAccountId(session.user.id, 'donatepay');

	if (!accountId) {
		return json({ error: 'DonatePay аккаунт не найден' }, { status: 404 });
	}

	try {
		const response = await fetch('https://donatepay.ru/api/v2/socket/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ access_token: tokenRes.accessToken }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`DonatePay API rejected subscription request: Status ${response.status}`, errorText);
			return json({ error: `${errorText} (${response.status})` }, { status: response.status });
		}

		const data = await response.json() as { token: string };

		if (!data.token) {
			return json({ error: 'Ошибка получения Centrifuge токена' }, { status: 502 });
		}

		return json({
			roomId: `$public:${accountId}`,
			accessToken: tokenRes.accessToken,
			socketAccessToken: data.token
		}, { status: 200 });

	} catch (error) {
		console.error('Error fetching Centrifuge token:', error);
		return new Response('Что-то пошло не так', { status: 500 });
	}
};