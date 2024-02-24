// See https://kit.svelte.dev/docs/types#app

import type { IDonationAlertsUserData, ITwitchUserData } from "$lib/interfaces";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			twitchChannel?: ITwitchUserData;
			donationAlertsUser?: IDonationAlertsUserData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
