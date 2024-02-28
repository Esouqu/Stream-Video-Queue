import { DONATIONALERTS_SESSION, TWITCH_SESSION } from "$env/static/private";
import type { IDonationAlertsRefreshToken, IDonationAlertsUserData, ITwitchUserData } from "$lib/interfaces";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  let twitchChannel: ITwitchUserData | undefined;
  let donationAlertsUser: IDonationAlertsUserData | undefined;

  const isTwitchTokenValid = await fetch('/api/twitch/validate')
    .then((res) => (res.status !== 401 && res.status !== 400));

  if (!isTwitchTokenValid) {
    await fetch('/api/twitch/refresh', { method: 'POST' });
  }

  if (cookies.get(TWITCH_SESSION)) {
    twitchChannel = await fetch('/api/twitch/user')
      .then((res) => res.json())
      .then((data: ITwitchUserData) => data);
  }

  let testConsole: IDonationAlertsRefreshToken | undefined;

  if (!cookies.get(DONATIONALERTS_SESSION)) {
    await fetch('/api/donationalerts/refresh', { method: 'POST' })
      .then((res) => res.json()).then((data: IDonationAlertsRefreshToken) => testConsole = data);
  }

  if (cookies.get(DONATIONALERTS_SESSION)) {
    donationAlertsUser = await fetch('/api/donationalerts/user')
      .then((res) => res.json())
      .then((data: IDonationAlertsUserData) => data);
  }

  return {
    testConsole,
    twitchChannel,
    donationAlertsUser
  }
};