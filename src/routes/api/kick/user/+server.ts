import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { auth } from "$lib/server/auth";
import { db, fetchFullProviderAccount } from "$lib/server/db";
import { account } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ request, fetch }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return json({ error: 'Не авторизован' }, { status: 401 });
	}

	const linkedAccount = await fetchFullProviderAccount(session.user.id, "kick");

	if (!linkedAccount) {
		return json({ error: 'Kick не подключен' }, { status: 400 });
	}

	if (linkedAccount.username) {
		return json({
			user: session.user,
			username: linkedAccount.username
		});
	}

	const tokenRes = await auth.api.getAccessToken({
		body: { providerId: "kick" },
		headers: request.headers
	});

	if (!tokenRes?.accessToken) {
		return json({ error: 'Kick токен не найден' }, { status: 400 });
	}

	try {
		const kickResponse = await fetch("https://api.kick.com/public/v1/users", {
			headers: {
				"Authorization": `Bearer ${tokenRes.accessToken}`
			}
		});

		if (!kickResponse.ok) {
			const error = await kickResponse.json();
			return json(
				{ error: `${error.message || 'Ошибка Kick API'} (${kickResponse.status})` },
				{ status: kickResponse.status }
			);
		}

		const payload = await kickResponse.json();
		const fetchedUsername = payload.data[0].name;

		if (!fetchedUsername) {
			return json({ user: session.user, username: null });
		}

		await db
			.update(account)
			.set({ username: fetchedUsername })
			.where(eq(account.id, linkedAccount.id));

		return json({
			user: session.user,
			username: fetchedUsername
		});

	} catch (err) {
		console.error("Kick Sync Error:", err);
		return json({ error: "Что-то пошло не так" }, { status: 500 });
	}
};
