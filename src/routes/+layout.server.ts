import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const fetchUserData = async (url: string, refreshUrl: string) => {
    const response = await fetch(url);

    if (response.status === 401) {
      await fetch(refreshUrl, { method: 'POST' });
      const refreshedResponse = await fetch(url);
      return refreshedResponse.status === 200 ? refreshedResponse.json() : null;
    }

    return response.status === 200 ? response.json() : null;
  };

  const [twitchUserData, donationAlertsUserData] = await Promise.all([
    fetchUserData('/api/twitch/user', '/api/twitch/refresh'),
    fetchUserData('/api/donationalerts/user', '/api/donationalerts/refresh')
  ]);

  return {
    twitchUserData,
    donationAlertsUserData,
  };
}
