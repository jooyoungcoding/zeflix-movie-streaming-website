import { PlaybackProvider } from "./playback-provider.interface";
import { PlaybackSource } from "../types/playback.types";
import { resolveAnimeMalId } from "../service/anime-id-mapper.service";

export type YenimeAudioMode = "sub" | "dub";

/**
 * YenimeProvider
 * Dedicated playback provider for Japanese Anime movies and TV series.
 *
 * ⚠️  CURRENTLY DISABLED — NOT ACTIVE IN ROUTING
 * ─────────────────────────────────────────────────────────────────────────
 * Reason: All known Yenime/MegaPlay sources are currently unavailable:
 *   - megaplay.buzz (/stream/)  → Player script crash: "urlParams is not defined"
 *                                  (e1-player.min.js broken deploy)
 *   - yenime.net (/watch/)      → Playback does not start within grace period
 *   - megaplay.buzz (/embed/)   → Same underlying player issue
 *
 * Anime content currently falls back to VidLink → SuperEmbed.
 *
 * ✅  HOW TO RE-ENABLE:
 *   1. Verify megaplay.buzz or yenime.net sources are working correctly
 *      (check that e1-player.min.js no longer throws "urlParams is not defined")
 *   2. Restore source A in getMovieSources() and getTvEpisodeSources() if needed
 *   3. Uncomment [this.yenimeProvider, ...] in PlaybackRouter.resolveProviders()
 *      in src/features/playback/service/playback.router.ts
 *   4. Remove the @disabled marker below
 *
 * @disabled All Yenime/MegaPlay sources unavailable — player script broken
 */
export class YenimeProvider implements PlaybackProvider {
  readonly id = "yenime";
  readonly name = "YenimeProvider";
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.YENIME_STREAM_URL || "https://megaplay.buzz"
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Resolve single movie playback source for Anime feature films (Source A)
   */
  async getMovieSource(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const sources = await this.getMovieSources(tmdbId, metadata);
    return sources[0] || null;
  }

  /**
   * Resolve all available movie playback sources in priority order:
   * [Source B (Yenime Mirror - primary), Source C (MegaPlay Embed)]
   *
   * NOTE: Source A (megaplay.buzz /stream/) is temporarily disabled —
   * their player script (e1-player.min.js) is currently broken with
   * "urlParams is not defined", causing immediate playback failure.
   * Re-enable once megaplay.buzz fixes their player deploy.
   */
  async getMovieSources(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return [];

    const title = typeof metadata?.title === "string" ? metadata.title : undefined;
    const malId = await resolveAnimeMalId(cleanId, title, 1);
    if (!malId) {
      console.warn(`[YenimeProvider] No MAL ID found for Anime Movie (TMDB: ${cleanId}, Title: ${title || "N/A"})`);
      return [];
    }

    const audio: YenimeAudioMode = metadata?.audio === "dub" ? "dub" : "sub";

    // Source B: Primary Streaming Server (Yenime Mirror)
    const sourceB: PlaybackSource = {
      type: "iframe",
      url: `https://yenime.net/watch/${malId}/1`,
      providerId: this.id,
      providerName: `${this.name} - Source B`,
      customData: {
        category: "anime",
        sourceName: "Source B",
        server: "YenimeMirror",
        malId,
        audio,
        isMovie: true,
      },
    };

    // Source C: Alternate Streaming Server (MegaPlay Embed Backup)
    const sourceC: PlaybackSource = {
      type: "iframe",
      url: `${this.baseUrl}/embed/mal/${malId}/1/${audio}`,
      providerId: this.id,
      providerName: `${this.name} - Source C`,
      customData: {
        category: "anime",
        sourceName: "Source C",
        server: "MegaPlayEmbed",
        malId,
        audio,
        isMovie: true,
      },
    };

    return [sourceB, sourceC];
  }

  /**
   * Resolve single TV episode playback source for Anime episodic series (Source A)
   */
  async getTvEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const sources = await this.getTvEpisodeSources(
      tmdbId,
      seasonNumber,
      episodeNumber,
      metadata
    );
    return sources[0] || null;
  }

  /**
   * Resolve all available TV episode playback sources in priority order:
   * [Source B (Yenime Mirror - primary), Source C (MegaPlay Embed)]
   *
   * NOTE: Source A (megaplay.buzz /stream/) is temporarily disabled —
   * their player script (e1-player.min.js) is currently broken with
   * "urlParams is not defined", causing immediate playback failure.
   * Re-enable once megaplay.buzz fixes their player deploy.
   */
  async getTvEpisodeSources(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource[]> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return [];

    const s = Math.max(1, Math.floor(seasonNumber || 1));
    const ep = Math.max(1, Math.floor(episodeNumber || 1));
    const title = typeof metadata?.title === "string" ? metadata.title : undefined;

    const malId = await resolveAnimeMalId(cleanId, title, s);
    if (!malId) {
      console.warn(`[YenimeProvider] No MAL ID found for Anime Series (TMDB: ${cleanId}, Title: ${title || "N/A"}, Season: ${s})`);
      return [];
    }

    const audio: YenimeAudioMode = metadata?.audio === "dub" ? "dub" : "sub";

    // Source B: Primary Streaming Server (Yenime Mirror)
    const sourceB: PlaybackSource = {
      type: "iframe",
      url: `https://yenime.net/watch/${malId}/${ep}`,
      providerId: this.id,
      providerName: `${this.name} - Source B`,
      customData: {
        category: "anime",
        sourceName: "Source B",
        server: "YenimeMirror",
        malId,
        season: s,
        episode: ep,
        audio,
        isMovie: false,
      },
    };

    // Source C: Alternate Streaming Server (MegaPlay Embed Backup)
    const sourceC: PlaybackSource = {
      type: "iframe",
      url: `${this.baseUrl}/embed/mal/${malId}/${ep}/${audio}`,
      providerId: this.id,
      providerName: `${this.name} - Source C`,
      customData: {
        category: "anime",
        sourceName: "Source C",
        server: "MegaPlayEmbed",
        malId,
        season: s,
        episode: ep,
        audio,
        isMovie: false,
      },
    };

    return [sourceB, sourceC];
  }

  /**
   * Builds the appropriate Yenime player embed URL based on configured base URL
   */
  private buildStreamUrl(
    malId: number,
    episodeNumber: number,
    audio: YenimeAudioMode,
    isMovie: boolean
  ): string {
    // If custom endpoint configured with yenime.net
    if (this.baseUrl.includes("yenime.net")) {
      if (isMovie) {
        return `${this.baseUrl}/watch/${malId}/1`;
      }
      return `${this.baseUrl}/watch/${malId}/${episodeNumber}`;
    }

    // Default: Yenime MegaPlay streaming server format (https://megaplay.buzz/stream/mal/{malId}/{episode}/{audio})
    return `${this.baseUrl}/stream/mal/${malId}/${episodeNumber}/${audio}`;
  }

  private sanitizeTmdbId(id: string): string | null {
    if (!id || typeof id !== "string") return null;
    const trimmed = id.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return null;
    }
    return trimmed;
  }
}
