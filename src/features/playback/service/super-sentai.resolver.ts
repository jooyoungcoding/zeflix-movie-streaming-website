import { SentaiSource } from "../sources/sentai-source.interface";
import { TokuFunSource } from "../sources/tokufun.source";
import { TokuAddonSource } from "../sources/tokuaddon.source";
import { PlaybackSource } from "../types/playback.types";
import { isSuperSentaiSeries } from "./super-sentai.detector";

export interface SentaiContentQuery {
  tmdbId: string;
  type: "movie" | "tv";
  title?: string;
  season?: number;
  episode?: number;
  metadata?: Record<string, unknown>;
}

/**
 * SuperSentaiResolver
 * Dedicated content resolver responsible for:
 * 1. TMDB movie/TV information matching
 * 2. Title matching
 * 3. Season and episode matching
 * 4. Source matching across available Sentai sources (TokuFun, TokuAddon)
 * 5. Normalizing source results into standard PlaybackSource format
 *
 * Designed for extensibility: new sources can be added to the sources list
 * without rewriting SuperSentaiProvider or PlaybackService.
 */
export class SuperSentaiResolver {
  private readonly sources: SentaiSource[];

  constructor(
    sources?: SentaiSource[]
  ) {
    this.sources = sources && sources.length > 0
      ? sources
      : [new TokuFunSource(), new TokuAddonSource()];
  }

  /**
   * Get list of registered Sentai sources
   */
  getRegisteredSources(): ReadonlyArray<SentaiSource> {
    return this.sources;
  }

  /**
   * Check whether the requested content is a valid Super Sentai installment
   */
  isSentaiContent(tmdbId: string, metadata?: Record<string, unknown>): boolean {
    return isSuperSentaiSeries(tmdbId, metadata);
  }

  /**
   * Resolve primary TV episode playback source (tries TokuFun, then TokuAddon)
   */
  async resolveTvEpisode(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    title?: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const all = await this.resolveTvEpisodeAllSources(
      tmdbId,
      seasonNumber,
      episodeNumber,
      title,
      metadata
    );
    return all[0] || null;
  }

  /**
   * Resolve TV episode playback sources from ALL adapters in priority order:
   * [TokuFun, TokuAddon]
   * Returned sources are normalized into common PlaybackSource format for automatic fallback.
   */
  async resolveTvEpisodeAllSources(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    title?: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]> {
    const cleanId = String(tmdbId || "").trim();
    if (!cleanId) return [];

    const s = Math.max(1, Math.floor(seasonNumber || 1));
    const ep = Math.max(1, Math.floor(episodeNumber || 1));
    const cleanTitle = (title || "").trim();

    const normalizedSources: PlaybackSource[] = [];

    for (const source of this.sources) {
      try {
        const resolved = await source.resolveEpisode(
          cleanId,
          s,
          ep,
          cleanTitle,
          metadata
        );

        if (resolved && resolved.url) {
          normalizedSources.push(this.normalizePlaybackSource(resolved, cleanId, s, ep));
        }
      } catch (err) {
        console.error(
          `[SuperSentaiResolver] Source ${source.name} failed to resolve episode S${s}E${ep} for ${cleanId}:`,
          err
        );
      }
    }

    return normalizedSources;
  }

  /**
   * Resolve primary movie playback source (tries TokuFun, then TokuAddon)
   */
  async resolveMovie(
    tmdbId: string,
    title?: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const all = await this.resolveMovieAllSources(tmdbId, title, metadata);
    return all[0] || null;
  }

  /**
   * Resolve movie playback sources from ALL adapters in priority order:
   * [TokuFun, TokuAddon]
   */
  async resolveMovieAllSources(
    tmdbId: string,
    title?: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]> {
    const cleanId = String(tmdbId || "").trim();
    if (!cleanId) return [];

    const cleanTitle = (title || "").trim();
    const normalizedSources: PlaybackSource[] = [];

    for (const source of this.sources) {
      try {
        const resolved = await source.resolveMovie(
          cleanId,
          cleanTitle,
          metadata
        );

        if (resolved && resolved.url) {
          normalizedSources.push(this.normalizePlaybackSource(resolved, cleanId));
        }
      } catch (err) {
        console.error(
          `[SuperSentaiResolver] Source ${source.name} failed to resolve movie for ${cleanId}:`,
          err
        );
      }
    }

    return normalizedSources;
  }

  /**
   * Normalizes any Sentai source result into the canonical PlaybackSource schema
   */
  private normalizePlaybackSource(
    source: PlaybackSource,
    tmdbId: string,
    season?: number,
    episode?: number
  ): PlaybackSource {
    return {
      type: source.type || "iframe",
      url: source.url,
      providerId: source.providerId || "super-sentai",
      providerName: source.providerName || "SuperSentai",
      customData: {
        ...(source.customData || {}),
        franchise: "Super Sentai",
        tmdbId,
        ...(season !== undefined ? { season } : {}),
        ...(episode !== undefined ? { episode } : {}),
      },
    };
  }
}
