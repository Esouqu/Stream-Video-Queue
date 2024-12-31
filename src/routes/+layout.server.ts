import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const fetchUserData = async (url: string, refreshUrl: string): Promise<Record<string, unknown> | null> => {
    try {
      const response = await fetch(url);

      if (response.status === 401) {
        await fetch(refreshUrl, { method: 'POST' });
        const refreshedResponse = await fetch(url);
        if (refreshedResponse.status !== 200) return null;
        return refreshedResponse.json();
      }

      if (response.status !== 200) return null;

      return response.json();
    } catch (error) {
      console.error('[load]', error);
      return null;
    }
  };

  const [twitchUserData, donationAlertsUserData] = await Promise.all([
    fetchUserData('/api/twitch/user', '/api/twitch/refresh'),
    fetchUserData('/api/donationalerts/user', '/api/donationalerts/refresh')
  ]);

  return {
    twitchUserData: twitchUserData ?? {},
    donationAlertsUserData: donationAlertsUserData ?? {},
    id: crypto.randomUUID(),
  };
};
