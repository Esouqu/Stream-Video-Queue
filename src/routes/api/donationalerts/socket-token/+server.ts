import { auth } from "$lib/server/auth";
import { json, type RequestHandler } from "@sveltejs/kit";

type SocketTokenData = {
	channels: {
		token: string;
		channel: string;
	}[]
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	let body: { client: string };
	try {
		body = await request.json();
		if (!body.client) {
			return json({ error: 'Missing required field: "client"' }, { status: 400 });
		}
	} catch {
		return json({ error: 'Invalid or empty JSON body' }, { status: 400 });
	}

	const tokenRes = await auth.api.getAccessToken({
		body: { providerId: "donationalerts" },
		headers: request.headers
	});

	if (!tokenRes?.accessToken) {
		return json({ error: 'DonationAlerts token not found' }, { status: 400 });
	}

	const accounts = await auth.api.listUserAccounts({ headers: request.headers });
	const daAccount = accounts.find((account) => account.providerId === 'donationalerts');

	if (!daAccount?.accountId) {
		return new Response('DonationAlerts аккаунт не найден', { status: 404 });
	}

	const expectedChannel = `$alerts:donation_${daAccount.accountId}`;
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
			return new Response(`Ошибка DonationAlerts API: ${response.status}`, { status: response.status });
		}

		const data = await response.json() as SocketTokenData;

		if (!data?.channels[0]?.token) {
			return new Response('Токен подписки отсутствует в ответе DonationAlerts', { status: 502 });
		}

		return json({
			token: data.channels[0].token,
			channel: expectedChannel,
		}, { status: 200 });

	} catch (error) {
		console.error('Error subscribing to donation alerts Centrifuge:', error);
		return new Response('Что-то пошло не так', { status: 500 });
	}
};
