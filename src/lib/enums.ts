export enum INTEGRATION {
  TWITCH = 'twitch',
  DONATIONALERTS = 'donationalerts',
}

export enum SOCKET_STATE {
  NOT_EXISTS,
  OPEN,
  CLOSED,
  CONNECTING,
}

export enum TIMER_STATE {
  UNSTARTED = 'unstarted',
  PAUSED = 'paused',
  RUNNING = 'running',
  FINISHED = 'finished',
}

export enum YOUTUBE_PLAYER_STATE {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}