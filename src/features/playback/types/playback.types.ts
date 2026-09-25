/**
 * Playback Types & Contract Definitions for Zeflix Video Architecture
 */

export type VideoSourceType = "iframe" | "hls" | "mp4";

export type PlaybackStatus =
  | "IDLE"
  | "PLAYER_LOADING"
  | "PLAYER_LOADED"
  | "PLAYING"
  | "PAUSED"
  | "PLAYBACK_STALLED"
  | "PLAYBACK_ERROR"
  | "ENDED";

export interface PlaybackSource {
  /**
   * The type of playback source:
   * - 'iframe': Embedded web player
   * - 'hls': HLS stream manifest (.m3u8)
   * - 'mp4': Direct progressive video
   */
  type: VideoSourceType;

  /**
   * Playback URL
   */
  url: string;

  /**
   * Unique identifier of provider ('vidlink' | 'superembed' | 'super-sentai')
   */
  providerId: string;

  /**
   * Human-readable provider name
   */
  providerName: string;

  /**
   * Optional custom attributes / headers
   */
  customData?: Record<string, unknown>;
}

export type WatchCategory = "anime" | "sentai" | "normal";

export interface PlaybackMediaInfo {
  tmdbId: string;
  type: "movie" | "tv";
  title: string;
  season?: number;
  episode?: number;
  category?: WatchCategory;
  isSuperSentai?: boolean;
  isAnime?: boolean;
}

export interface PlaybackSession {
  mediaInfo: PlaybackMediaInfo;
  /**
   * Sources ordered by priority:
   * - Anime: [YenimeProvider, VidLinkProvider, SuperEmbedProvider]
   * - Japanese Super Sentai: [SuperSentaiProvider, VidLinkProvider, SuperEmbedProvider]
   * - Normal Content: [VidLinkProvider, SuperEmbedProvider]
   */
  sources: PlaybackSource[];
}

export interface PlaybackEventPayload {
  event: "play" | "pause" | "timeupdate" | "ended" | "error" | "stalled";
  currentTime?: number;
  duration?: number;
}
