import type { IVideoData } from "../interfaces";

interface IYoutubeResponseData {
  title: string;
  channelTitle: string;
  thumbnail: string;
}

class YoutubeApi {
  public async getVideo(id: string): Promise<IYoutubeResponseData | undefined> {
    const res = await fetch(`api/youtube/video?id=${id}`).then((res) => res);

    if (res.ok) {
      const { snippet } = await res.json().then((data: IVideoData) => data.items[0]);

      return {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        thumbnail: snippet.thumbnails.medium.url,
      }
    }
  }
}

const youtubeApi = new YoutubeApi();

export default youtubeApi;