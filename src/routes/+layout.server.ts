import { DONATIONALERTS_SESSION, TWITCH_SESSION } from "$env/static/private";
import type { IAuthTokenData, IDonationAlertsUserData, ITwitchUserData } from "$lib/interfaces";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  let donationAlertsSession: string | undefined = cookies.get(DONATIONALERTS_SESSION);
  let twitchChannel: ITwitchUserData | undefined;
  let donationAlertsUser: IDonationAlertsUserData | undefined;

  const isTwitchTokenValid = await fetch('/api/twitch/validate')
    .then((res) => (res.status !== 401 && res.status !== 400));

  if (!isTwitchTokenValid) {
    await fetch('/api/twitch/refresh', { method: 'POST' })
      .then((res) => res);
  }

  if (cookies.get(TWITCH_SESSION)) {
    twitchChannel = await fetch('/api/twitch/user')
      .then((res) => res.json())
      .then((data: ITwitchUserData) => data);
  }

  if (!donationAlertsSession) {
    const response = await fetch('/api/donationalerts/refresh', { method: 'POST' })
      .then((res) => res);

    if (response.status === 200) {
      donationAlertsSession = await response.json().then((data: IAuthTokenData) => data.access_token);
    }
  }

  if (donationAlertsSession) {
    donationAlertsUser = await fetch('/api/donationalerts/user')
      .then((res) => res.json())
      .then((data: IDonationAlertsUserData) => data);
  }

  return {
    twitchChannel,
    donationAlertsUser
  }
};