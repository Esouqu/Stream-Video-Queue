import { DONATIONALERTS_SESSION, TWITCH_SESSION } from "$env/static/private";
import type { IAuthTokenData, IDonationAlertsUserData, ITwitchUserData } from "$lib/interfaces";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  let twitchSession: string | undefined = cookies.get(TWITCH_SESSION);
  let donationAlertsSession: string | undefined = cookies.get(DONATIONALERTS_SESSION);
  let twitchChannel: ITwitchUserData | undefined;
  let donationAlertsUser: IDonationAlertsUserData | undefined;

  if (!twitchSession) {
    const response = await fetch('/api/twitch/refresh', { method: 'POST' })
      .then((res) => res);

    if (response.ok) {
      twitchSession = await response.json().then((data: IAuthTokenData) => data.access_token);
    }
  }

  if (!donationAlertsSession) {
    const response = await fetch('/api/donationalerts/refresh', { method: 'POST' })
      .then((res) => res);

    if (response.ok) {
      donationAlertsSession = await response.json().then((data: IAuthTokenData) => data.access_token);
    }
  }

  if (twitchSession) {
    await fetch('/api/twitch/user')
      .then((res) => res.json())
      .then((data: ITwitchUserData) => twitchChannel = data);
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