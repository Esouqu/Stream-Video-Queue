import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { BETTER_AUTH_SECRET, TWITCH_CLIENT_ID, TWITCH_SECRET_KEY, DONATIONALERTS_CLIENT_ID, DONATIONALERTS_SECRET_KEY, KICK_CLIENT_ID, KICK_SECRET_KEY } from '$env/static/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { genericOAuth } from 'better-auth/plugins';
import { AVAILABLE_PROVIDERS } from '$lib/providers';

const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : PUBLIC_ORIGIN;

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "sqlite" }),
	baseURL,
	secret: BETTER_AUTH_SECRET,
	advanced: {
		cookiePrefix: "stream_queue",
	},
	session: {
		strategy: "cookie",
		expiresIn: 60 * 60 * 24 * 30, // 30-day
		updateAge: 60 * 60 * 24, // 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60, // 1 hour
			strategy: "jwt",
		}
	},
	account: {
		storeStateStrategy: "cookie",
		storeAccountCookie: true,
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
			trustedProviders: AVAILABLE_PROVIDERS.map((p) => p.id),
		},
	},
	user: {
		additionalFields: {
			donationAlertsSocketToken: { type: "string", required: false, returned: true }
		},
	},
	socialProviders: {
		twitch: {
			clientId: TWITCH_CLIENT_ID,
			clientSecret: TWITCH_SECRET_KEY
		},
		kick: {
			clientId: KICK_CLIENT_ID,
			clientSecret: KICK_SECRET_KEY
		}
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: "donationalerts",
					clientId: DONATIONALERTS_CLIENT_ID,
					clientSecret: DONATIONALERTS_SECRET_KEY,
					authorizationUrl: "https://donationalerts.com/oauth/authorize",
					tokenUrl: "https://www.donationalerts.com/oauth/token",
					userInfoUrl: "https://www.donationalerts.com/api/v1/user/oauth",
					scopes: ['oauth-user-show', 'oauth-donation-subscribe'],
					mapProfileToUser: (profile) => {
						const userData = profile.data;

						return {
							// Default fields if necessary
							id: String(userData.id),
							name: userData.name,
							email: userData.email || `${userData.id}@donationalerts.local`,
							image: userData.avatar,

							//user.additionalFields
							donationAlertsSocketToken: userData.socket_connection_token,
						};
					}
				}
			]
		}),
		// make sure this is the last plugin in the array
		sveltekitCookies(getRequestEvent)
	]
});

export type Session = typeof auth.$Infer.Session;