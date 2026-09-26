import { PlaybackSource } from "../types/playback.types";

/**
 * Common Playback Provider Interface
 * All playback providers (VidLink, SuperEmbed, SuperSentai) must implement this contract
 * ensuring complete interchangeability from the perspective of PlaybackService.
 */
export interface PlaybackProvider {
  /**
   * Provider identifier code (e.g., 'vidlink', 'superembed', 'super-sentai')
   */
  readonly id: string;

  /**
   * Human-friendly provider name
   */
  readonly name: string;

  /**
   * Resolve movie playback source by TMDB ID
   */
  getMovieSource(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null>;

  /**
   * Resolve TV episode playback source by TMDB TV ID, season number, and episode number
   */
  getTvEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null>;

  /**
   * Resolve all available movie playback sources in priority order (Source A, Source B, Source C)
   */
  getMovieSources?(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]>;

  /**
   * Resolve all available TV episode playback sources in priority order (Source A, Source B, Source C)
   */
  getTvEpisodeSources?(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]>;
}
