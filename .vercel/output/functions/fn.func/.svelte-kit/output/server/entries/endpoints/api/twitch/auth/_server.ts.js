import { a as PUBLIC_TWITCH_CLIENT_ID } from "../../../../../chunks/public.js";
import { r as redirect } from "../../../../../chunks/index.js";
const GET = async () => {
  const twitchScope = "channel:manage:polls+channel:read:polls";
  const redirectUrl = "https://stream-video-queue.vercel.app/redirect/twitch";
  const queryParams = `response_type=code&client_id=${PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${twitchScope}`;
  const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?${queryParams}`;
  throw redirect(302, twitchAuthUrl);
};
export {
  GET
};
