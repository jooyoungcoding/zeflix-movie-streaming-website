import {
  PlaybackSession,
  PlaybackSource,
  WatchCategory,
} from "../types/playback.types";
import { SuperSentaiMetadataCandidate } from "./super-sentai.detector";
import { AnimeMetadataCandidate } from "./anime.detector";
import { PlaybackRouter } from "./playback.router";
import { determineWatchCategory } from "./watch-routing.service";

export type PlaybackMetadataOptions = SuperSentaiMetadataCandidate &
  AnimeMetadataCandidate & {
    category?: WatchCategory;
  };

/**
 * PlaybackService
 * Orchestrates playback provider resolution and produces PlaybackSessions.
 * Respects Zeflix layered architecture: UI -> Client API -> Route Handler -> Controller -> Service.
 */
export class PlaybackService {
  constructor(private readonly router: PlaybackRouter = new PlaybackRouter()) {}

  /**
   * Resolve movie playback session
   */
  async getMoviePlayback(
    tmdbId: string,
    title: string = "",
    metadata?: PlaybackMetadataOptions
  ): Promise<PlaybackSession> {
    const cleanId = String(tmdbId || "").trim();

    // Centralized category validation: do not blindly trust URL category if metadata indicates incompatibility
    let effectiveCategory: WatchCategory | undefined = metadata?.category;
    if (metadata) {
      const verifiedCategory = determineWatchCategory({
        tmdbId: cleanId,
        mediaType: "movie",
        ...metadata,
      });
      if (effectiveCategory && effectiveCategory !== verifiedCategory) {
        effectiveCategory = verifiedCategory;
      } else if (!effectiveCategory) {
        effectiveCategory = verifiedCategory;
      }
    }

    const routingContext = {
      mediaType: "movie" as const,
      tmdbId: cleanId,
      title: title || "",
      category: effectiveCategory,
      metadata,
    };

    const isSentai = effectiveCategory === "sentai" || this.router.isSuperSentai(routingContext);
    const isAnime = effectiveCategory === "anime" || this.router.isAnime(routingContext);
    const category: WatchCategory =
      effectiveCategory || (isSentai ? "sentai" : isAnime ? "anime" : "normal");
    const providers = this.router.resolveProviders({ ...routingContext, category });

    const providerMetadata: Record<string, unknown> = {
      title: title || "",
      ...(metadata || {}),
    };

    const sources: PlaybackSource[] = [];
    for (const provider of providers) {
      try {
        if (
          "getMovieSources" in provider &&
          typeof (provider as { getMovieSources: unknown }).getMovieSources === "function"
        ) {
          const providerSources = await (
            provider as {
              getMovieSources: (
                id: string,
                meta?: Record<string, unknown>
              ) => Promise<PlaybackSource[]>;
            }
          ).getMovieSources(cleanId, providerMetadata);

          if (Array.isArray(providerSources) && providerSources.length > 0) {
            sources.push(...providerSources);
            continue;
          }
        }

        const source = await provider.getMovieSource(cleanId, providerMetadata);
        if (source) {
          sources.push(source);
        }
      } catch (err) {
        console.error(`[PlaybackService] Error from provider ${provider.name}:`, err);
      }
    }

    return {
      mediaInfo: {
        tmdbId: cleanId,
        type: "movie",
        title: title || "",
        category,
        isSuperSentai: isSentai,
        isAnime,
      },
      sources,
    };
  }

  /**
   * Resolve TV episode playback session
   */
  async getTvPlayback(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    title: string = "",
    metadata?: PlaybackMetadataOptions
  ): Promise<PlaybackSession> {
    const cleanId = String(tmdbId || "").trim();
    const s = Math.max(1, Math.floor(seasonNumber || 1));
    const ep = Math.max(1, Math.floor(episodeNumber || 1));

    // Centralized category validation: do not blindly trust URL category if metadata indicates incompatibility
    let effectiveCategory: WatchCategory | undefined = metadata?.category;
    if (metadata) {
      const verifiedCategory = determineWatchCategory({
        tmdbId: cleanId,
        mediaType: "tv",
        ...metadata,
      });
      if (effectiveCategory && effectiveCategory !== verifiedCategory) {
        effectiveCategory = verifiedCategory;
      } else if (!effectiveCategory) {
        effectiveCategory = verifiedCategory;
      }
    }

    const routingContext = {
      mediaType: "tv" as const,
      tmdbId: cleanId,
      title: title || "",
      category: effectiveCategory,
      metadata,
    };

    const isSentai = effectiveCategory === "sentai" || this.router.isSuperSentai(routingContext);
    const isAnime = effectiveCategory === "anime" || this.router.isAnime(routingContext);
    const category: WatchCategory =
      effectiveCategory || (isSentai ? "sentai" : isAnime ? "anime" : "normal");
    const providers = this.router.resolveProviders({ ...routingContext, category });

    const providerMetadata: Record<string, unknown> = {
      title: title || "",
      season: s,
      episode: ep,
      category,
      ...(metadata || {}),
    };

    const sources: PlaybackSource[] = [];
    for (const provider of providers) {
      try {
        if (
          "getTvEpisodeSources" in provider &&
          typeof (provider as { getTvEpisodeSources: unknown }).getTvEpisodeSources === "function"
        ) {
          const providerSources = await (
            provider as {
              getTvEpisodeSources: (
                id: string,
                s: number,
                e: number,
                meta?: Record<string, unknown>
              ) => Promise<PlaybackSource[]>;
            }
          ).getTvEpisodeSources(cleanId, s, ep, providerMetadata);

          if (Array.isArray(providerSources) && providerSources.length > 0) {
            sources.push(...providerSources);
            continue;
          }
        }

        const source = await provider.getTvEpisodeSource(cleanId, s, ep, providerMetadata);
        if (source) {
          sources.push(source);
        }
      } catch (err) {
        console.error(`[PlaybackService] Error from provider ${provider.name}:`, err);
      }
    }

    return {
      mediaInfo: {
        tmdbId: cleanId,
        type: "tv",
        title: title || "",
        season: s,
        episode: ep,
        category,
        isSuperSentai: isSentai,
        isAnime,
      },
      sources,
    };
  }
}

// Application-wide singleton instance
export const defaultPlaybackService = new PlaybackService();
