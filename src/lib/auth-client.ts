import { createAuthClient } from "better-auth/client";
import { genericOAuthClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./server/auth";

export const authClient = createAuthClient({
	plugins: [
		genericOAuthClient(),
		inferAdditionalFields<typeof auth>()
	]
})