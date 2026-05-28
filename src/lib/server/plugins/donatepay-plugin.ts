import { type BetterAuthPlugin } from "better-auth";
import * as z from 'zod';
import { createAuthEndpoint, APIError, sessionMiddleware } from "better-auth/api";
import { db } from "../db";
import { account } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const donatePayPlugin = () => {
	return {
		id: "donatepay-linking",
		endpoints: {
			linkDonatePay: createAuthEndpoint(
				"/donatepay/link",
				{
					method: "POST",
					body: z.object({
						apiKey: z.string(),
					}),
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const session = ctx.context.session;
					console.log(session)

					if (!session) {
						throw new APIError("UNAUTHORIZED", { message: "Сессия не найдена." });
					}

					const { apiKey } = ctx.body;
					const trimmedKey = apiKey?.trim();
					if (!trimmedKey) {
						throw new APIError("BAD_REQUEST", { message: "API ключ не указан." });
					}

					try {
						const response = await fetch(`https://donatepay.ru/api/v1/user?access_token=${apiKey}`);
						if (!response.ok) {
							throw new APIError("BAD_REQUEST", { message: "Не удалось связаться с сервером DonatePay." });
						}

						const result = await response.json();
						if (result.status === "error" || !result.data?.id) {
							throw new APIError("BAD_REQUEST", { message: "Неверный DonatePay API ключ." });
						}

						const donatePayUserId = String(result.data.id);

						const duplicateAccount = await db.query.account.findFirst({
							where: and(
								eq(account.accountId, donatePayUserId),
								eq(account.providerId, "donatepay")
							)
						});

						if (duplicateAccount && duplicateAccount.userId !== session.user.id) {
							throw new APIError("BAD_REQUEST", { message: "Этот DonatePay аккаунт уже привязан к другому пользователю." });
						}

						const existingAccount = await db.query.account.findFirst({
							where: and(
								eq(account.userId, session.user.id),
								eq(account.providerId, "donatepay")
							)
						});

						if (existingAccount) {
							await db.update(account)
								.set({
									accountId: donatePayUserId,
									accessToken: trimmedKey,
									updatedAt: new Date()
								})
								.where(eq(account.id, existingAccount.id));
						} else {
							await db.insert(account).values({
								id: crypto.randomUUID(),
								userId: session.user.id,
								providerId: "donatepay",
								accountId: donatePayUserId,
								accessToken: trimmedKey,
								createdAt: new Date(),
								updatedAt: new Date()
							});
						}

						return ctx.json({ success: true });
					} catch (error) {
						if (error instanceof APIError) throw error;
						console.error("DonatePay error:", error);
						throw new APIError("INTERNAL_SERVER_ERROR", { message: "Внутренняя ошибка сервера при привязке." });
					}
				}
			),

			unlinkDonatePay: createAuthEndpoint(
				"/donatepay/unlink",
				{
					method: "GET",
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const session = ctx.context.session;
					if (!session) {
						throw new APIError("UNAUTHORIZED", { message: "Сессия не найдена." });
					}

					try {
						const existingAccount = await db.query.account.findFirst({
							where: and(
								eq(account.userId, session.user.id),
								eq(account.providerId, "donatepay")
							)
						});

						if (!existingAccount) {
							throw new APIError("NOT_FOUND", { message: "Привязанный DonatePay аккаунт не найден." });
						}

						await db.delete(account)
							.where(eq(account.id, existingAccount.id));

						return ctx.json({ success: true });
					} catch (error) {
						if (error instanceof APIError) throw error;
						console.error("DonatePay unlinking plugin error:", error);
						throw new APIError("INTERNAL_SERVER_ERROR", { message: "Внутренняя ошибка сервера при отвязке." });
					}
				}
			),
		}
	} satisfies BetterAuthPlugin;
};

export type DonatePayPluginInstance = ReturnType<typeof donatePayPlugin>;
