import { createAuthClient } from "better-auth/client";
import { genericOAuthClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./server/auth";
import { donatePayClientPlugin } from "./plugins/donatepay-client";

export const authClient = createAuthClient({
	plugins: [
		donatePayClientPlugin(),
		genericOAuthClient(),
		inferAdditionalFields<typeof auth>()
	]
}); 