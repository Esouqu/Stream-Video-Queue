import { DONATIONALERTS_REFRESH_TOKEN, DONATIONALERTS_SESSION } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete(DONATIONALERTS_SESSION, { path: '/' });
  cookies.delete(DONATIONALERTS_REFRESH_TOKEN, { path: '/' });

  return new Response('OK', { status: 200 });
};