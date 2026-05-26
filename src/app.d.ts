import type { Session } from '$lib/server/auth';
import type { Account } from 'better-auth';

type RequiredOnly<T> = {
	[K in keyof T as undefined extends T[K] ? never : K]: T[K];
};
export type StrictAccount = RequiredOnly<Account>;
declare global {
	namespace App {
		// interface Locals {}
		// interface Error {}
		interface PageData {
			user?: Session['user'];
			accounts?: StrictAccount[];
		}
		interface PageState {
			showSettings: boolean;
		}
		// interface Platform {}
	}
}

export { };
