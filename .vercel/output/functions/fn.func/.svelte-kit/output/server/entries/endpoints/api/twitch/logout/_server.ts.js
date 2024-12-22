import { T as TWITCH_SESSION, c as TWITCH_REFRESH_TOKEN } from "../../../../../chunks/private.js";
const GET = async ({ cookies }) => {
  cookies.delete(TWITCH_SESSION, { path: "/" });
  cookies.delete(TWITCH_REFRESH_TOKEN, { path: "/" });
  return new Response("OK", { status: 200 });
};
export {
  GET
};
