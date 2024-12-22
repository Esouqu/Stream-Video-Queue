import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.Du2mJKD_.js","_app/immutable/chunks/disclose-version.Cz5Qo27d.js","_app/immutable/chunks/runtime.Ctm-79fp.js","_app/immutable/chunks/index-client.DpACmXYB.js","_app/immutable/chunks/store.BTqSLNIM.js","_app/immutable/chunks/button.BBNELvsa.js","_app/immutable/chunks/legacy._zovnSf6.js","_app/immutable/chunks/stores.N1HH8j_I.js","_app/immutable/chunks/entry.bsinTynN.js"];
export const stylesheets = ["_app/immutable/assets/0.CNH2LOI9.css"];
export const fonts = [];
