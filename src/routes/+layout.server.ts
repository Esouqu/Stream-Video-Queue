import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ request }) => {
	const safeHeaders = new Headers(request.headers);

	// console.group("[LAYOUT QUERY START]");
	// const start = performance.now();

	const [session, accounts] = await Promise.all([
		auth.api.getSession({ headers: safeHeaders }),
		auth.api.listUserAccounts({ headers: safeHeaders })
			.catch(() => [])
	]);

	// const duration = performance.now() - start;
	// console.log(`[LAYOUT QUERY END] Query took ${duration.toFixed(2)} ms`);
	// console.groupEnd();

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
