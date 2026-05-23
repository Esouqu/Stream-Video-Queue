import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ request }) => {
	const safeHeaders = new Headers(request.headers);
	const [session, accounts] = await Promise.all([
		auth.api.getSession({ headers: safeHeaders }),
		auth.api.listUserAccounts({ headers: safeHeaders })
			.catch(() => [])
	]);

	if (!session) {
		return {
			user: null,
			accounts: []
		};
	}

	return {
		user: session.user,
		accounts
	};
};
