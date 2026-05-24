import { auth } from "$lib/server/auth";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ fetch, request }) => {
	try {
		const tokenRes = await auth.api.getAccessToken({
			body: { providerId: "donationalerts" },
			headers: request.headers
		});

		if (!tokenRes?.accessToken) {
			return json({ error: 'DonationAlerts token not found' }, { status: 400 });
		}

		const response = await fetch('https://www.donationalerts.com/api/v1/user/oauth', {
			headers: { Authorization: `Bearer ${tokenRes.accessToken}` },
		});

		if (!response.ok) {
			return json({ error: 'Failed to get provider data' }, { status: response.status });
		}

		const { data: userData } = await response.json();
		return json(userData);

	} catch {
		return json({ error: 'Not authenticated or invalid session' }, { status: 401 });
	}
};