import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { TWITCH_CLIENT_ID } from "$env/static/private";
import { auth } from "$lib/server/auth";
import { db, fetchFullProviderAccount } from "$lib/server/db";
import { account } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ request, fetch }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Не авторизован' }, { status: 401 });
	}

	const linkedAccount = await fetchFullProviderAccount(session.user.id, "twitch");

	if (!linkedAccount) return json({ error: 'Twitch не подключен' }, { status: 400 });

	if (linkedAccount.username) {
		return json({
			user: session.user,
			username: linkedAccount.username
		});
	}

	const tokenRes = await auth.api.getAccessToken({
		body: { providerId: "twitch" },
		headers: request.headers
	});

	if (!tokenRes?.accessToken) {
		return json({ error: 'Twitch токен не найден' }, { status: 400 });
	}

	try {
		const twitchResponse = await fetch("https://api.twitch.tv/helix/users", {
			headers: {
				"Client-ID": TWITCH_CLIENT_ID,
				"Authorization": `Bearer ${tokenRes.accessToken}`
			}
		});

		if (!twitchResponse.ok) {
			const error = await twitchResponse.json();
			return json({ error: `${error.message} (${twitchResponse.status})` }, { status: twitchResponse.status });
		}

		const payload = await twitchResponse.json();
		const fetchedUsername = payload.data[0]?.login;

		if (!fetchedUsername) return json({ user: session.user, username: null });

		await db
			.update(account)
			.set({ username: fetchedUsername })
			.where(eq(account.id, linkedAccount.id));

		return json({
			user: session.user,
			username: fetchedUsername
		});

	} catch (err) {
		console.error("Twitch Sync Error:", err);
		return json({ error: "Что-то пошло не так" }, { status: 500 });
	}
};
