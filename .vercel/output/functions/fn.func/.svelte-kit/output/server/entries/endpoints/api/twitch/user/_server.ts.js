import { T as TWITCH_SESSION } from "../../../../../chunks/private.js";
import { a as PUBLIC_TWITCH_CLIENT_ID } from "../../../../../chunks/public.js";
const GET = async ({ cookies }) => {
  const twitchSession = cookies.get(TWITCH_SESSION);
  if (!twitchSession) {
    return new Response("No Twitch session available", { status: 401 });
  }
  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${twitchSession}`,
      "Client-Id": PUBLIC_TWITCH_CLIENT_ID
    }
  });
  const userData = await response.json();
  return new Response(JSON.stringify(userData.data[0]), { status: 200 });
};
export {
  GET
};
