import { P as PUBLIC_DONATIONALERTS_CLIENT_ID } from "../../../../../chunks/public.js";
import { r as redirect } from "../../../../../chunks/index.js";
const GET = async () => {
  const scope = "oauth-user-show oauth-donation-subscribe";
  const redirectUrl = "https://stream-video-queue.vercel.app/redirect/donationalerts";
  const clientId = PUBLIC_DONATIONALERTS_CLIENT_ID;
  const url = `https://www.donationalerts.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=${scope}`;
  throw redirect(302, url);
};
export {
  GET
};
