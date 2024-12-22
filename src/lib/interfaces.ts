export interface IVideoData {
  "kind": string,
  "etag": string,
  "items": {
    "kind": string,
    "etag": string,
    "id": string,
    "snippet": {
      "publishedAt": string,
      "channelId": string,
      "title": string,
      "description": string,
      "thumbnails": {
        "default": {
          "url": string,
          "width": number,
          "height": number
        },
        "medium": {
          "url": string,
          "width": number,
          "height": number
        },
        "high": {
          "url": string,
          "width": number,
          "height": number
        },
        "standard": {
          "url": string,
          "width": number,
          "height": number
        },
        "maxres": {
          "url": string,
          "width": number,
          "height": number
        }
      },
      "channelTitle": string,
      "tags": string[],
      "categoryId": string,
      "liveBroadcastContent": string,
      "defaultLanguage": string,
      "localized": {
        "title": string,
        "description": string
      },
      "defaultAudioLanguage": string
    },
    "contentDetails": {
      "duration": string,
      "dimension": string,
      "definition": string,
      "caption": string,
      "licensedContent": boolean,
      "contentRating": object,
      "projection": string
    },
    "statistics": {
      "viewCount": string,
      "likeCount": string,
      "favoriteCount": string,
      "commentCount": string
    }
  }[],
  "pageInfo": {
    "totalResults": number,
    "resultsPerPage": number
  }
}

export interface IAuthTokenData {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface ITwitchValidation {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: number;
  expires_in: number;
  status?: number;
  message?: string;
}

export interface IDonationAlertsRefreshToken extends Omit<IAuthTokenData, 'refresh_token'> {
  refresh_token?: string;
}

export interface IDonationAlertsUserData {
  id: number;
  code: string;
  name: string;
  is_active: number;
  avatar: string;
  email: string | null;
  language: string;
  socket_connection_token: string;
}

export interface IDonationSocketData {
  id: number | string;
  name: string;
  username: string;
  amount: number;
  amount_in_user_currency: number;
  currency: string;
  message: string;
  created_at: string;
  message_type: string;
  paying_system: string;
  is_shown: boolean;
  recipient_name: string;
  recipient: string;
  shown_at: string;
  reason: string;
}

export interface ITwitchUserData {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email: string;
  created_at: Date;
}

export interface IQueueItem {
  id: number;
  submittedBy: string[];
  donationAmount: number;
  message: string;
  isWatched: boolean;

  videoId: string;
  startSeconds: number;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export interface TwitchVideoData {
  id: string;
  stream_id: string | null;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: 'archive' | 'highlight' | 'upload';
  duration: string;
  muted_segments: Array<{ duration: number; offset: number }>;
}

export interface TwitchVideoDataResponse {
  data: TwitchVideoData[];
}
