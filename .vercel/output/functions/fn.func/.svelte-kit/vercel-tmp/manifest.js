export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.DEQqrV4n.js","app":"_app/immutable/entry/app.BIOrcsiZ.js","imports":["_app/immutable/entry/start.DEQqrV4n.js","_app/immutable/chunks/entry.bsinTynN.js","_app/immutable/chunks/runtime.Ctm-79fp.js","_app/immutable/entry/app.BIOrcsiZ.js","_app/immutable/chunks/runtime.Ctm-79fp.js","_app/immutable/chunks/store.BTqSLNIM.js","_app/immutable/chunks/disclose-version.Cz5Qo27d.js","_app/immutable/chunks/index-client.DpACmXYB.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/centrifugo/subscribe",
				pattern: /^\/api\/centrifugo\/subscribe\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/centrifugo/subscribe/_server.ts.js'))
			},
			{
				id: "/api/donationalerts/auth",
				pattern: /^\/api\/donationalerts\/auth\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/donationalerts/auth/_server.ts.js'))
			},
			{
				id: "/api/donationalerts/logout",
				pattern: /^\/api\/donationalerts\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/donationalerts/logout/_server.ts.js'))
			},
			{
				id: "/api/donationalerts/refresh",
				pattern: /^\/api\/donationalerts\/refresh\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/donationalerts/refresh/_server.ts.js'))
			},
			{
				id: "/api/donationalerts/user",
				pattern: /^\/api\/donationalerts\/user\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/donationalerts/user/_server.ts.js'))
			},
			{
				id: "/api/twitch/auth",
				pattern: /^\/api\/twitch\/auth\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/twitch/auth/_server.ts.js'))
			},
			{
				id: "/api/twitch/logout",
				pattern: /^\/api\/twitch\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/twitch/logout/_server.ts.js'))
			},
			{
				id: "/api/twitch/refresh",
				pattern: /^\/api\/twitch\/refresh\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/twitch/refresh/_server.ts.js'))
			},
			{
				id: "/api/twitch/user",
				pattern: /^\/api\/twitch\/user\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/twitch/user/_server.ts.js'))
			},
			{
				id: "/api/twitch/validate",
				pattern: /^\/api\/twitch\/validate\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/twitch/validate/_server.ts.js'))
			},
			{
				id: "/api/youtube/video",
				pattern: /^\/api\/youtube\/video\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/youtube/video/_server.ts.js'))
			},
			{
				id: "/redirect/donationalerts",
				pattern: /^\/redirect\/donationalerts\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/redirect/twitch",
				pattern: /^\/redirect\/twitch\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
