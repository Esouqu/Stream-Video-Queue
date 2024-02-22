import { TWITCH_SESSION } from "$env/static/private";
import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
import type { ITwitchPollData } from "$lib/interfaces";
import type { RequestHandler } from "@sveltejs/kit";

// export const GET: RequestHandler = async ({ cookies, url }) => {
//   const session = cookies.get('TYtwitchSession');
//   const broadcasterId = url.searchParams.get('broadcaster_id');
//   const rewardsUrl = `https://api.twitch.tv/helix/polls?broadcaster_id=${broadcasterId}`;

//   if (!session) return new Response('No twitch session available', { status: 401 });

//   const reward = await axios.get(rewardsUrl, {
//     headers: {
//       'Authorization': `Bearer ${session}`,
//       'client-id': PUBLIC_TWITCH_CLIENT_ID,
//       "Content-Type": 'application/json',
//     }
//   }).then((res) => res.data);

//   return new Response(JSON.stringify(reward), { status: 200 });
// };

export const POST: RequestHandler = async ({ cookies, url }) => {
  const session = cookies.get(TWITCH_SESSION);
  const broadcasterId = url.searchParams.get('broadcaster_id');
  const pollsUrl = `https://api.twitch.tv/helix/polls`;

  let poll;

  if (!session) return new Response('No twitch session available', { status: 401 });

  const response = await fetch(pollsUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session}`,
      'client-id': PUBLIC_TWITCH_CLIENT_ID,
      "Content-Type": 'application/json',
    },
    body: JSON.stringify({
      "broadcaster_id": broadcasterId,
      "title": "Оставить или Пропустить?",
      "choices": [
        { "title": "Оставить" },
        { "title": "Пропустить" }
      ],
      "channel_points_voting_enabled": false,
      "channel_points_per_vote": 100,
      "duration": 1800
    }),
  });

  if (response.status === 200) {
    poll = await response.json().then((data: ITwitchPollData) => data);
    return new Response(JSON.stringify(poll), { status: 200 });
  } else if (response.status === 400) {
    const status = await response.json().then((data) => data.status);
    return new Response(JSON.stringify('Bad Request'), { status });
  } else {
    const status = await response.json().then((data) => data.status);
    return new Response(JSON.stringify('Something went wrong'), { status });
  }
};