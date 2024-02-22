// See https://kit.svelte.dev/docs/types#app

import type { ITwitchUserData } from "$lib/interfaces";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			twitchSession?: string;
			twitchChannel?: ITwitchUserData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
