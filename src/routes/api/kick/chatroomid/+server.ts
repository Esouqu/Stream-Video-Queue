import { auth } from "$lib/server/auth";
import { db, fetchProviderAccount } from "$lib/server/db";
import { account } from "$lib/server/db/schema";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ request, fetch }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Не авторизован' }, { status: 401 });
	}

	const kickAccount = await fetchProviderAccount(session.user.id, 'kick');

	if (!kickAccount || !kickAccount.accountId) {
		return json({ error: 'Kick не подключен' }, { status: 400 });
	}

	if (kickAccount.chatroomId) {
		return json({
			kickAccountId: kickAccount.accountId,
			chatroomId: kickAccount.chatroomId
		});
	}

	const oauthToken = kickAccount?.accessToken;
	if (!oauthToken) {
		return json({ error: 'Kick токен не найден' }, { status: 401 });
	}

	const userResponse = await fetch(`https://api.kick.com/public/v1/users`, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${oauthToken}`,
			'Accept': 'application/json'
		}
	});

	if (!userResponse.ok) {
		const error = await userResponse.json();
		console.log(error);

		return json({ error: `${error.message} (${userResponse.status})` }, { status: userResponse.status });
	}

	const userData = await userResponse.json();
	const slug = userData?.data[0].name.toLowerCase();

	if (!slug) {
		return json({ error: 'Не удалось найти никнейм пользователя' }, { status: 404 });
	}

	const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
		method: 'GET',
		headers: {
			"Authorization": `Bearer ${oauthToken}`,
			"Accept": "*/*"
		},
	});

	const data = await response.json();
	console.log(data)

	const channelsResponse = await fetch(`https://kick.com/api/v1/channels/${slug}`, {
		method: 'GET',
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			'Accept': 'application/json'
		}
	});

	if (!channelsResponse.ok) {
		const error = await channelsResponse.json();
		console.log(error)
		return json({ error: `${error.message} (${channelsResponse.status})` }, { status: 502 });
	}

	const internalData = await channelsResponse.json();
	const fetchedChatroomId = internalData?.chatroom?.id?.toString();

	if (!fetchedChatroomId) {
		return json({ error: 'Не удалось получить chatroomId' }, { status: 502 });
	}

	await db
		.update(account)
		.set({ chatroomId: fetchedChatroomId })
		.where(eq(account.id, kickAccount.id));

	return json({
		kickAccountId: kickAccount.accountId,
		chatroomId: fetchedChatroomId
	});
}