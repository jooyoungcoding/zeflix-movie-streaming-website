import { PlaybackSource } from "../types/playback.types";

/**
 * Normalized Sentai Source Adapter Interface
 * All Super Sentai streaming sources (TokuFun, TokuAddon, etc.)
 * must implement this contract for seamless interchangeability.
 */
export interface SentaiSource {
  /**
   * Unique source identifier (e.g., 'tokufun', 'tokuaddon')
   */
  readonly id: string;

  /**
   * Human-readable source name
   */
  readonly name: string;

  /**
   * Resolve movie/special playback source for Super Sentai content
   */
  resolveMovie(
    tmdbId: string,
    title?: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null>;

  /**
   * Resolve TV episode playback source for Super Sentai series
   */
  resolveEpisode(
    tmdbId: string,
    season: number,
    episode: number,
    title?: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null>;
}
