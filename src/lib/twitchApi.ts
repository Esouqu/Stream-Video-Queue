import chat from "./stores/chat";
import type { ITwitchUserData } from "./interfaces";

class TwitchApi {
  public validateTokenWithInterval() {
    const validationInterval = 1000 * 60 * 60; // 1 hour

    const intervalId = setInterval(async () => {
      const isValid = await this.validateToken();
      const isRefreshed = isValid || await this.refreshToken();

      if (isValid || isRefreshed) return;

      clearInterval(intervalId);
      chat.disconnect();
      location.reload();
    }, validationInterval);
  }

  public async refreshToken() {
    const response = await fetch('/api/twitch/refresh', {
      method: 'POST'
    }).then((res) => res);

    return response.status === 200 ? true : false;
  }

  public async validateToken() {
    const response = await fetch('/api/twitch/validate')
      .then((res) => res);

    return response.status === 200 ? true : false;
  }

  public async getUser() {
    const isValid = await this.validateToken();
    const isRefreshed = isValid || await this.refreshToken();

    if (!isValid && !isRefreshed) return;

    return await fetch('/api/twitch/user')
      .then((res) => res.json())
      .then((data: ITwitchUserData) => data);
  }
}

const twitchApi = new TwitchApi();

export default twitchApi;
