import { auth } from "$lib/server/auth";
import { fetchProviderAccount } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";

type SocketTokenData = {
	channels: {
		token: string;
		channel: string;
	}[]
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const body: { userId: string, client: string } = await request.json();

	const tokenRes = await auth.api.getAccessToken({
		body: { providerId: "donationalerts" },
		headers: request.headers
	});

	if (!tokenRes?.accessToken) {
		return json({ error: 'DonationAlerts токен не найден' }, { status: 400 });
	}

	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Не авторизован' }, { status: 401 });
	}

	const account = await fetchProviderAccount(session.user.id, 'donationalerts');

	if (!account) {
		return json({ error: 'DonationAlerts аккаунт не найден' }, { status: 404 });
	}

	const expectedChannel = `$alerts:donation_${account.accountId}`;
	const url = 'https://www.donationalerts.com/api/v1/centrifuge/subscribe';

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${tokenRes.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				client: body.client,
				channels: [expectedChannel]
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`DonationAlerts API rejected subscription request: Status ${response.status}`, errorText);
			return json({ error: `${errorText} (${response.status})` }, { status: response.status });
		}

		const data = await response.json() as SocketTokenData;

		if (!data?.channels[0]?.token) {
			return json({ error: 'Ошибка получения токена Centrifuge' }, { status: 502 });
		}

		return json({
			token: data.channels[0].token,
		}, { status: 200 });

	} catch (error) {
		console.error('Error subscribing to donation alerts Centrifuge:', error);
		return json({ error: 'Что-то пошло не так' }, { status: 500 });
	}
};
