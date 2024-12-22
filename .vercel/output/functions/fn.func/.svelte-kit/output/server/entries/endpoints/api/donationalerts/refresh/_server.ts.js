import { d as dev } from "../../../../../chunks/index3.js";
import { a as DONATIONALERTS_REFRESH_TOKEN, b as DONATIONALERTS_SECRET_KEY, D as DONATIONALERTS_SESSION } from "../../../../../chunks/private.js";
import { P as PUBLIC_DONATIONALERTS_CLIENT_ID } from "../../../../../chunks/public.js";
import "../../../../../chunks/index.js";
const POST = async ({ cookies }) => {
  const refreshToken = cookies.get(DONATIONALERTS_REFRESH_TOKEN);
  const scope = "oauth-user-show oauth-donation-subscribe";
  if (!refreshToken) return new Response("No refresh token is available", { status: 400 });
  try {
    const response = await fetch("https://www.donationalerts.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: PUBLIC_DONATIONALERTS_CLIENT_ID,
        client_secret: DONATIONALERTS_SECRET_KEY,
        refresh_token: refreshToken,
        scope
      })
    }).then((res) => res);
    const tokenData = await response.json().then((data) => data);
    cookies.set(DONATIONALERTS_SESSION, tokenData.access_token, {
      path: "/",
      secure: !dev,
      expires: new Date(Date.now() + tokenData.expires_in)
    });
    if (tokenData.refresh_token) {
      cookies.set(DONATIONALERTS_REFRESH_TOKEN, tokenData.refresh_token, {
        path: "/",
        secure: !dev,
        expires: new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30)
      });
    }
    return new Response(JSON.stringify(tokenData), { status: 200 });
  } catch (err) {
    const error = err;
    if (error.response?.status === 401) {
      return new Response("The donation alerts refresh token is invalid", { status: 401 });
    } else {
      return new Response("Something went wrong", { status: 500 });
    }
  }
};
export {
  POST
};
