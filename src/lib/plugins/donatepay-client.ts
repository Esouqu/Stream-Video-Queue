import type { BetterAuthClientPlugin } from "better-auth/client";
import type { DonatePayPluginInstance } from "$lib/server/plugins/donatepay-plugin";

export const donatePayClientPlugin = () => {
	return {
		id: "donatepay-linking",
		$InferServerPlugin: {} as unknown as DonatePayPluginInstance,
	} satisfies BetterAuthClientPlugin;
};