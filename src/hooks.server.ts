// import { DONATIONALERTS_SESSION, TWITCH_SESSION } from "$env/static/private";
// import type { IDonationAlertsUserData, ITwitchUserData } from "$lib/interfaces";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // const donationalertsSession = event.cookies.get(DONATIONALERTS_SESSION);
  // const twitchChannel = event.cookies.get(TWITCH_SESSION);

  // if (donationalertsSession && event.url.pathname === '/api/donationalerts/refresh') {
  //   const donationAlertsUser = await fetch('/api/donationalerts/user')
  //     .then((res) => res.json())
  //     .then((data: IDonationAlertsUserData) => data);

  //   event.locals.donationAlertsUser = donationAlertsUser;
  // }

  // if (twitchChannel && event.url.pathname === '/api/twitch/refresh') {
  //   const twitchChannel = await fetch('/api/twitch/user')
  //     .then((res) => res.json())
  //     .then((data: ITwitchUserData) => data);

  //   event.locals.twitchChannel = twitchChannel;
  // }
  console.log(event.url.pathname)

  return resolve(event);
}