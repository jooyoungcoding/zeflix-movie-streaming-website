import { PlaybackProvider } from "./playback-provider.interface";
import { PlaybackSource } from "../types/playback.types";
import { SuperSentaiResolver } from "../service/super-sentai.resolver";

/**
 * SuperSentaiProvider
 * Main entry point for Super Sentai / Tokusatsu playback in PlaybackService.
 * Orchestrates playback flow by delegating source matching and resolution
 * to SuperSentaiResolver (TokuFun -> TokuAddon).
 *
 * Does NOT contain source-specific logic directly.
 */
export class SuperSentaiProvider implements PlaybackProvider {
  readonly id = "super-sentai";
  readonly name = "SuperSentaiProvider";

  constructor(
    private readonly resolver: SuperSentaiResolver = new SuperSentaiResolver()
  ) {}

  /**
   * Resolve single movie playback source for Super Sentai theatrical releases
   */
  async getMovieSource(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const title = (metadata?.title as string) || "";
    return await this.resolver.resolveMovie(tmdbId, title, metadata);
  }

  /**
   * Resolve all available movie playback sources in priority order: [TokuFun, TokuAddon]
   */
  async getMovieSources(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]> {
    const title = (metadata?.title as string) || "";
    return await this.resolver.resolveMovieAllSources(tmdbId, title, metadata);
  }

  /**
   * Resolve single TV episode playback source for Super Sentai TV series
   */
  async getTvEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const title = (metadata?.title as string) || "";
    return await this.resolver.resolveTvEpisode(
      tmdbId,
      seasonNumber,
      episodeNumber,
      title,
      metadata
    );
  }

  /**
   * Resolve all available TV episode playback sources in priority order: [TokuFun, TokuAddon]
   * Used for automatic fallback cascade.
   */
  async getTvEpisodeSources(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]> {
    const title = (metadata?.title as string) || "";
    return await this.resolver.resolveTvEpisodeAllSources(
      tmdbId,
      seasonNumber,
      episodeNumber,
      title,
      metadata
    );
  }
}
