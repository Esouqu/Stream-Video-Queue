import { G as GOOGLE_API_KEY } from "../../../../../chunks/private.js";
const GET = async ({ url }) => {
  const videoId = url.searchParams.get("id");
  const video = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${videoId}&key=${GOOGLE_API_KEY}`;
  const videoData = await fetch(video).then((data) => data).then((res) => res.json());
  return new Response(JSON.stringify(videoData), { status: 200 });
};
export {
  GET
};
