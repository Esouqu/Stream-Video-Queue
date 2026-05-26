import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { TWITCH_CLIENT_ID } from "$env/static/private";
import { auth } from "$lib/server/auth";
import { db, fetchProviderAccount } from "$lib/server/db";
import { account } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async (event) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) return json({ user: null, username: null });

	const twitchAccount = await fetchProviderAccount(session.user.id, "twitch");

	if (!twitchAccount) return json({ error: 'Twitch не подключен' }, { status: 400 });

	if (twitchAccount.username) {
		return json({
			user: session.user,
			username: twitchAccount.username
		});
	}

	if (!twitchAccount.accessToken) return json({ error: 'Twitch токен не найден' }, { status: 400 });

	try {
		const twitchResponse = await event.fetch("https://api.twitch.tv/helix/users", {
			headers: {
				"Client-ID": TWITCH_CLIENT_ID,
				"Authorization": `Bearer ${twitchAccount.accessToken}`
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
			.where(eq(account.id, twitchAccount.id));

		return json({
			user: session.user,
			username: fetchedUsername
		});

	} catch (err) {
		console.error("Twitch Sync Error:", err);
		return json({ error: "Что-то пошло не так" }, { status: 500 });
	}
};
