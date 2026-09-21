/**
 * Video Source & Provider Type Definitions for Zeflix Streaming Architecture
 */

export type VideoSourceType = "iframe" | "hls" | "mp4";

export interface VideoServerOption {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
}

export interface VideoSource {
  /**
   * The type of video playback source:
   * - 'iframe': Third-party embedded player widget
   * - 'hls': HTTP Live Streaming manifest (.m3u8) for native/Zeflix player
   * - 'mp4': Direct progressive MP4 video URL
   */
  type: VideoSourceType;
  /**
   * Primary URL for the video source or embed
   */
  url: string;
  /**
   * Name of the provider producing this stream/embed
   */
  providerName: string;
  /**
   * Optional title/metadata
   */
  title?: string;
  /**
   * Available alternative playback servers
   */
  servers?: VideoServerOption[];
  /**
   * Optional custom headers required for playback
   */
  headers?: Record<string, string>;
}

export interface VideoProvider {
  /**
   * Unique identifier name for the provider
   */
  readonly name: string;

  /**
   * Resolve movie playback source by TMDB ID
   */
  getMovieSource(tmdbId: string): Promise<VideoSource | null>;

  /**
   * Resolve TV episode playback source by TMDB ID, season number, and episode number
   */
  getEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<VideoSource | null>;
}
