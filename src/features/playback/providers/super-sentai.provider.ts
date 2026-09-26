import { PlaybackProvider } from "./playback-provider.interface";
import { PlaybackSource } from "../types/playback.types";
import { SuperSentaiResolver } from "../service/super-sentai.resolver";

/**
 * SuperSentaiProvider
 * Main entry point for Super Sentai / Tokusatsu playback in PlaybackService.
 * Orchestrates playback flow by delegating source matching and resolution
 * to SuperSentaiResolver (TokuFun -> TokuAddon -> TokuStream).
 *
 * ⚠️  CURRENTLY DISABLED — NOT ACTIVE IN ROUTING
 * ─────────────────────────────────────────────────────────────────────────
 * Reason: All known Toku streaming sources block cross-origin iframe embedding:
 *   - toku.fun       → X-Frame-Options: sameorigin
 *   - tokusub.net    → X-Frame-Options: sameorigin
 *   - tokustream.ovh → X-Frame-Options: sameorigin
 *
 * This is a server-enforced browser security policy and CANNOT be bypassed
 * from the client side. Sentai content currently falls back to VidLink and
 * SuperEmbed which support TMDB ID lookups and allow iframe embedding.
 *
 * ✅  HOW TO RE-ENABLE:
 *   1. Find a Sentai streaming provider that allows cross-origin iframe embedding
 *      (i.e., does NOT set X-Frame-Options: sameorigin or deny, and has permissive
 *       Content-Security-Policy frame-ancestors)
 *   2. Set the provider's base URL in the appropriate env var or source constructor
 *   3. Add SuperSentaiProvider back to PlaybackRouter.resolveProviders() in
 *      src/features/playback/service/playback.router.ts
 *   4. Remove the @disabled marker below
 *
 * @disabled X-Frame-Options: sameorigin on all known Toku sources
 */
export class SuperSentaiProvider implements PlaybackProvider {
  readonly id = "super-sentai";
  readonly name = "SuperSentaiProvider";

  /**
   * Set to true when this provider has been restored to the active routing chain.
   * Currently false because all known Toku sources block iframe embedding.
   */
  static readonly ENABLED = false;

  constructor(
    private readonly resolver: SuperSentaiResolver = new SuperSentaiResolver()
  ) {}

  /**
   * Resolve single movie playback source for Super Sentai theatrical releases.
   * @disabled — Returns null because provider is not active in routing chain.
   * See class-level JSDoc for re-enable instructions.
   */
  async getMovieSource(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const title = (metadata?.title as string) || "";
    return await this.resolver.resolveMovie(tmdbId, title, metadata);
  }

  /**
   * Resolve all available movie playback sources in priority order: [TokuFun, TokuAddon, TokuStream]
   * @disabled — Returns empty array because provider is not active in routing chain.
   */
  async getMovieSources(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]> {
    const title = (metadata?.title as string) || "";
    return await this.resolver.resolveMovieAllSources(tmdbId, title, metadata);
  }

  /**
   * Resolve single TV episode playback source for Super Sentai TV series.
   * @disabled — Returns null because provider is not active in routing chain.
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
   * Resolve all available TV episode playback sources in priority order: [TokuFun, TokuAddon, TokuStream]
   * Used for automatic fallback cascade.
   * @disabled — Returns empty array because provider is not active in routing chain.
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
