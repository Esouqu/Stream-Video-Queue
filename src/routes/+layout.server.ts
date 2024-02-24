import { DONATIONALERTS_SESSION, TWITCH_SESSION } from "$env/static/private";
import type { IAuthTokenData, IDonationAlertsUserData, ITwitchUserData } from "$lib/interfaces";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  let twitchSession: string | undefined = cookies.get(TWITCH_SESSION);
  let donationAlertsSession: string | undefined = cookies.get(DONATIONALERTS_SESSION);
  let twitchChannel: ITwitchUserData | undefined;
  let donationAlertsUser: IDonationAlertsUserData | undefined;

  if (!twitchSession) {
    await fetch('/api/twitch/refresh', { method: 'POST' })
      .then((res) => res.json())
      .then((data: IAuthTokenData) => twitchSession = data.access_token);
  }

  if (!donationAlertsSession) {
    await fetch('/api/donationalerts/refresh', { method: 'POST' })
      .then((res) => res.json())
      .then((data: IAuthTokenData) => donationAlertsSession = data.access_token);
  }

  if (twitchSession) {
    const validationInterval = 1000 * 60 * 60;

    await fetch('/api/twitch/user')
      .then((res) => res.json())
      .then((data: ITwitchUserData) => twitchChannel = data);

    fetch('/api/twitch/validate');

    setInterval(async () => {
      fetch('/api/twitch/validate');
    }, validationInterval);
  }

  if (donationAlertsSession) {
    await fetch('/api/donationalerts/user')
      .then((res) => res.json())
      .then((data: IDonationAlertsUserData) => donationAlertsUser = data);
  }

  return {
    twitchChannel,
    donationAlertsUser
  }
};