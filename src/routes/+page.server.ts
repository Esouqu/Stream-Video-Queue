import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { account } from "$lib/server/db/schema";
import { SETTINGS_URL } from "$lib/constants";

export const actions: Actions = {
	linkDonatePay: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) throw redirect(302, "/");

		const formData = await request.formData();
		const apiKey = formData.get("apiKey")?.toString().trim();

		if (!apiKey) {
			return fail(400, { error: "API ключ не указан." });
		}

		try {
			const response = await fetch(`https://donatepay.ru/api/v1/user?access_token=${apiKey}`);
			const result = await response.json();

			if (result.status === "error" || !result.data?.id) {
				return fail(400, { error: "Неверный DonatePay API ключ." });
			}

			const donatePayUserId = String(result.data.id);

			const existingAccount = await db.query.account.findFirst({
				where: and(
					eq(account.userId, session.user.id),
					eq(account.providerId, "donatepay")
				)
			});

			if (existingAccount) {
				// If it exists, update it explicitly via its unique ID
				await db.update(account)
					.set({
						accountId: donatePayUserId,
						accessToken: apiKey,
						updatedAt: new Date()
					})
					.where(eq(account.id, existingAccount.id));
			} else {
				// If it doesn't exist, safely execute a clean insert
				await db.insert(account).values({
					id: crypto.randomUUID(),
					userId: session.user.id,
					providerId: "donatepay",
					accountId: donatePayUserId,
					accessToken: apiKey,
					createdAt: new Date(),
					updatedAt: new Date()
				});
			}

			return { success: true };
		} catch (err) {
			console.log(err)
			return fail(500, { error: "Не удалось привязать DonatePay." });
		}
	},
	unlinkDonatePay: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session) throw redirect(302, SETTINGS_URL);

		try {
			await db.delete(account)
				.where(
					and(
						eq(account.userId, session.user.id),
						eq(account.providerId, "donatepay")
					)
				);

			return { success: true };
		} catch (err) {
			console.error("Failed to unlink DonatePay:", err);
			return fail(500, { error: "Не удалось отвязать DonatePay." });
		}
	}
};
