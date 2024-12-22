import { d as dev } from "../../../../chunks/index3.js";
import { d as TWITCH_SECRET_KEY, T as TWITCH_SESSION, c as TWITCH_REFRESH_TOKEN } from "../../../../chunks/private.js";
import { a as PUBLIC_TWITCH_CLIENT_ID } from "../../../../chunks/public.js";
import { r as redirect } from "../../../../chunks/index.js";
const load = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const redirectUrl = "https://stream-video-queue.vercel.app/redirect/twitch";
  const tokenUrl = "https://id.twitch.tv/oauth2/token";
  if (!code) throw redirect(300, "/");
  const tokenData = await fetch(tokenUrl, {
    method: "POST",
    body: new URLSearchParams({
      client_id: PUBLIC_TWITCH_CLIENT_ID,
      client_secret: TWITCH_SECRET_KEY,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUrl
    })
  }).then((res) => res.json()).then((data) => data);
  cookies.set(TWITCH_SESSION, tokenData.access_token, {
    path: "/",
    secure: !dev,
    expires: new Date(Date.now() + tokenData.expires_in * 1e3)
  });
  cookies.set(TWITCH_REFRESH_TOKEN, tokenData.refresh_token, {
    path: "/",
    secure: !dev,
    expires: new Date(Date.now() + 30 * 1e3 * 60 * 60 * 24)
  });
  throw redirect(301, "/");
};
export {
  load
};
