import { d as dev } from "../../../../../chunks/index3.js";
import { c as TWITCH_REFRESH_TOKEN, d as TWITCH_SECRET_KEY, T as TWITCH_SESSION } from "../../../../../chunks/private.js";
import { a as PUBLIC_TWITCH_CLIENT_ID } from "../../../../../chunks/public.js";
import "../../../../../chunks/index.js";
const POST = async ({ cookies }) => {
  const refreshToken = cookies.get(TWITCH_REFRESH_TOKEN);
  if (!refreshToken) return new Response("Refresh token is required", { status: 400 });
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: PUBLIC_TWITCH_CLIENT_ID,
        client_secret: TWITCH_SECRET_KEY,
        refresh_token: refreshToken
      })
    });
    if (!response.ok) {
      cookies.delete(TWITCH_SESSION, { path: "/" });
      cookies.delete(TWITCH_REFRESH_TOKEN, { path: "/" });
      return new Response("Refresh token is invalid", { status: response.status });
    }
    const tokenData = await response.json();
    cookies.set(TWITCH_SESSION, tokenData.access_token, {
      path: "/",
      secure: !dev,
      expires: new Date(Date.now() + tokenData.expires_in * 1e3)
    });
    cookies.set(TWITCH_REFRESH_TOKEN, tokenData.refresh_token, {
      path: "/",
      secure: !dev,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
    });
    return new Response(JSON.stringify(tokenData), { status: 200 });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
};
export {
  POST
};
