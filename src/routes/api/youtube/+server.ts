import { GOOGLE_API_KEY } from "$env/static/private";
import type { IVideoData } from "$lib/interfaces";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
  const videoId = url.searchParams.get('video_id');
  const video = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${videoId}&key=${GOOGLE_API_KEY}`;

  const videoData: IVideoData = await fetch(video)
    .then((data) => data)
    .then((res) => res.json());

  return new Response(JSON.stringify(videoData), { status: 200 });
};