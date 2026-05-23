import { env } from '$env/dynamic/private';
import { defineConfig } from 'drizzle-kit';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'turso',
	dbCredentials: {
		authToken: env.DATABASE_AUTH_TOKEN,
		url: env.DATABASE_URL
	},
	verbose: true,
	strict: true
});
