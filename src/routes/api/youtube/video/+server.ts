import { GOOGLE_API_KEY } from "$env/static/private";
import type { VideoData } from "$lib/api/types";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const videoId = url.searchParams.get('id');
	const video = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${GOOGLE_API_KEY}`;

	const videoData: VideoData = await fetch(video)
		.then((data) => data)
		.then((res) => res.json());

	return new Response(JSON.stringify(videoData), { status: 200 });
};