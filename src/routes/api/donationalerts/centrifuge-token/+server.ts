import { auth } from "$lib/server/auth";
import { type RequestHandler } from "@sveltejs/kit";

type SocketTokenData = {
	channels: {
		token: string,
	}[]
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const safeHeaders = new Headers(request.headers);
	const [session, accounts] = await Promise.all([
		auth.api.getSession({ headers: safeHeaders }),
		auth.api.listUserAccounts({ headers: safeHeaders })
	]);
	const token = session?.user.donationAlertsSocketToken;
	const roomId = accounts.find((account) => account.providerId === 'donationalerts')?.id;

	if (!token || !roomId) {
		return new Response('Не авторизован.', { status: 401 });
	}

	if (!roomId) {
		return new Response('Не удалось получить DonationAlerts ID', { status: 404 });
	}

	const body = await request.json();
	const url = 'https://www.donationalerts.com/api/v1/centrifuge/subscribe';
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				...body,
				channels: [roomId]
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			return new Response(error, { status: response.status });
		}

		const data = await response.json() as SocketTokenData;

		return new Response(JSON.stringify(data.channels[0].token), { status: 200 });
	} catch (error) {
		console.error('Error subscribing to donation alerts Centrifuge:', error);
		return new Response('Что-то пошло не так', { status: 500 });
	}
};

