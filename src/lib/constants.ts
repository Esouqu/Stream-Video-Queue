export enum CHAT_STATE {
  NOT_EXISTS,
  CONNECTED,
  DISCONNECTED,
  CONNECTING,
}

export enum SOCKET_STATE {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export enum TIMER_STATE {
  IDLE = 'idle',
  PAUSED = 'paused',
  RUNNING = 'running',
}

export enum YOUTUBE_PLAYER_STATE {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}