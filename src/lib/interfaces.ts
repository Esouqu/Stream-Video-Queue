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

export interface IDonationData {
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

export interface ITwitchPollData {
  "data": [
    {
      "id": string,
      "broadcaster_id": string,
      "broadcaster_name": string,
      "broadcaster_login": string,
      "title": string,
      "choices": Array<{
        "id": string,
        "title": string,
        "votes": number,
        "channel_points_votes": number,
        "bits_votes": number
      }>,
      "bits_voting_enabled": boolean,
      "bits_per_vote": number,
      "channel_points_voting_enabled": boolean,
      "channel_points_per_vote": number,
      "status": "ACTIVE",
      "duration": number,
      "started_at": string
    }
  ]
}

export interface IUserInput {
  keepKeyword: string;
  skipKeyword: string;
  needed: number;
}

export interface IQueueVideoInfo {
  id: string;
  videoId: string;
  startSeconds: number;
  endSeconds?: number;
  title: string;
  channelTitle: string;
  thumbnail: string;
  username: string;
  price: number;
  message: string;
  isPaid: boolean;
  isWatched: boolean;
}

export interface IToggleWithInput {
  isEnabled: boolean;
  value: number;
}

export interface ITimerSettings extends IToggleWithInput {
  type: 'fixed' | 'perMinute';
}

export interface IDonationalertsSettings {
  linkAction: IToggleWithInput;
  skipAction: IToggleWithInput & {
    type: 'fixed' | 'percent';
  };
}