import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
  const [twitchUserData, donationAlertsUserData] = await Promise.all([
    (async () => {
      const response = await fetch('/api/twitch/user');

      if (response.status === 401) {
        await fetch('/api/twitch/refresh', { method: 'POST' });
        return (await fetch('/api/twitch/user')).json();
      }

      return response.json();
    })(),
    (async () => {
      const response = await fetch('/api/donationalerts/user');

      if (response.status === 401) {
        await fetch('/api/donationalerts/refresh', { method: 'POST' });
        return (await fetch('/api/donationalerts/user')).json();
      }

      return response.json();
    })(),
  ]);

  return {
    twitchUserData,
    donationAlertsUserData,
  }
}
