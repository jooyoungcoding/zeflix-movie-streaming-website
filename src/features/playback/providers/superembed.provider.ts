import { PlaybackProvider } from "./playback-provider.interface";
import { PlaybackSource } from "../types/playback.types";

/**
 * SuperEmbed Provider
 * Fallback provider for normal movies and TV shows.
 * Activated only when the primary provider (VidLink) fails or is unavailable.
 */
export class SuperEmbedProvider implements PlaybackProvider {
  readonly id = "superembed";
  readonly name = "SuperEmbed";
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.SUPEREMBED_BASE_URL || "https://multiembed.mov"
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Resolve movie playback source using TMDB movie ID
   */
  async getMovieSource(tmdbId: string): Promise<PlaybackSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    // Standard SuperEmbed TMDB movie embed format
    const url = `${this.baseUrl}/?video_id=${cleanId}&tmdb=1`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
    };
  }

  /**
   * Resolve TV episode playback source using TMDB TV ID, season number, and episode number
   */
  async getTvEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<PlaybackSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const s = Math.max(1, Math.floor(seasonNumber));
    const ep = Math.max(1, Math.floor(episodeNumber));

    // Standard SuperEmbed TMDB TV episode embed format
    const url = `${this.baseUrl}/?video_id=${cleanId}&s=${s}&e=${ep}&tmdb=1`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
    };
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
