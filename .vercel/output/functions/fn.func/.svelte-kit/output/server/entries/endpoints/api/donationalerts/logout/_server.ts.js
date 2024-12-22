import { D as DONATIONALERTS_SESSION, a as DONATIONALERTS_REFRESH_TOKEN } from "../../../../../chunks/private.js";
const GET = async ({ cookies }) => {
  cookies.delete(DONATIONALERTS_SESSION, { path: "/" });
  cookies.delete(DONATIONALERTS_REFRESH_TOKEN, { path: "/" });
  return new Response("OK", { status: 200 });
};
export {
  GET
};
