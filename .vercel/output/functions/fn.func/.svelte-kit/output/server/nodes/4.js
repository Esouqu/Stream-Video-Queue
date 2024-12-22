import * as server from '../entries/pages/redirect/twitch/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/redirect/twitch/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/redirect/twitch/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.Bld51Gjn.js","_app/immutable/chunks/disclose-version.Cz5Qo27d.js","_app/immutable/chunks/runtime.Ctm-79fp.js","_app/immutable/chunks/legacy._zovnSf6.js"];
export const stylesheets = [];
export const fonts = [];
