import { d as dev } from "../../../../chunks/index3.js";
import { b as DONATIONALERTS_SECRET_KEY, D as DONATIONALERTS_SESSION, a as DONATIONALERTS_REFRESH_TOKEN } from "../../../../chunks/private.js";
import { P as PUBLIC_DONATIONALERTS_CLIENT_ID } from "../../../../chunks/public.js";
import { r as redirect } from "../../../../chunks/index.js";
const load = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const redirectUrl = "https://stream-video-queue.vercel.app/redirect/donationalerts";
  const tokenUrl = "https://www.donationalerts.com/oauth/token";
  if (!code) throw redirect(300, "/");
  const tokenData = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      "grant_type": "authorization_code",
      "client_id": PUBLIC_DONATIONALERTS_CLIENT_ID,
      "client_secret": DONATIONALERTS_SECRET_KEY,
      "code": code,
      "redirect_uri": redirectUrl
    })
  }).then((res) => res.json()).then((data) => data);
  cookies.set(DONATIONALERTS_SESSION, tokenData.access_token, {
    path: "/",
    secure: !dev,
    expires: new Date(Date.now() + tokenData.expires_in)
  });
  cookies.set(DONATIONALERTS_REFRESH_TOKEN, tokenData.refresh_token, {
    path: "/",
    secure: !dev,
    expires: new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30)
  });
  throw redirect(301, "/");
};
export {
  load
};
