import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { eq, and } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');

const client = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });

export const db = drizzle(client, { schema, logger: true });

export async function fetchProviderAccount(userId: string, providerId: string) {
	const [result] = await db
		.select()
		.from(schema.account)
		.where(and(
			eq(schema.account.userId, userId),
			eq(schema.account.providerId, providerId)
		))
		.limit(1);

	return result || null;
}