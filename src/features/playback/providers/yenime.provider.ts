import { PlaybackProvider } from "./playback-provider.interface";
import { PlaybackSource } from "../types/playback.types";
import { resolveAnimeMalId } from "../service/anime-id-mapper.service";

export type YenimeAudioMode = "sub" | "dub";

/**
 * YenimeProvider
 * Dedicated playback provider for Japanese Anime movies and TV series.
 *
 * Architecture:
 * - Prioritized as FIRST choice ONLY for Anime content.
 * - Must NOT be used for normal Movies or normal TV Shows.
 * - Resolves required MyAnimeList (MAL) ID via AnimeIdMapperService.
 * - Constructs standard stream URL compatible with Yenime streaming ecosystem.
 * - Gracefully returns null if content cannot be mapped, allowing instant fallback to VidLink.
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
   * Resolve movie playback source for Anime feature films
   */
  async getMovieSource(
    tmdbId: string,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const title = typeof metadata?.title === "string" ? metadata.title : undefined;
    const malId = await resolveAnimeMalId(cleanId, title, 1);
    if (!malId) {
      console.warn(`[YenimeProvider] No MAL ID found for Anime Movie (TMDB: ${cleanId}, Title: ${title || "N/A"})`);
      return null;
    }

    const audio: YenimeAudioMode = metadata?.audio === "dub" ? "dub" : "sub";
    const url = this.buildStreamUrl(malId, 1, audio, true);

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        category: "anime",
        malId,
        audio,
        isMovie: true,
      },
    };
  }

  /**
   * Resolve TV episode playback source for Anime episodic series
   */
  async getTvEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const s = Math.max(1, Math.floor(seasonNumber || 1));
    const ep = Math.max(1, Math.floor(episodeNumber || 1));
    const title = typeof metadata?.title === "string" ? metadata.title : undefined;

    const malId = await resolveAnimeMalId(cleanId, title, s);
    if (!malId) {
      console.warn(`[YenimeProvider] No MAL ID found for Anime Series (TMDB: ${cleanId}, Title: ${title || "N/A"}, Season: ${s})`);
      return null;
    }

    const audio: YenimeAudioMode = metadata?.audio === "dub" ? "dub" : "sub";
    const url = this.buildStreamUrl(malId, ep, audio, false);

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        category: "anime",
        malId,
        season: s,
        episode: ep,
        audio,
        isMovie: false,
      },
    };
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
