import { VideoProvider, VideoSource } from "../video.types";

/**
 * VidSrc Embed Provider Implementation
 * Standard third-party iframe embed provider for movies and TV series
 */
export class VidSrcProvider implements VideoProvider {
  readonly name = "VidSrc";
  private readonly baseUrl: string;

  constructor(baseUrl: string = "https://vidsrc.to/embed") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Generates video source for a movie
   */
  async getMovieSource(tmdbId: string): Promise<VideoSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    return {
      type: "iframe",
      url: `${this.baseUrl}/movie/${cleanId}`,
      providerName: this.name,
    };
  }

  /**
   * Generates video source for a TV series episode
   */
  async getEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<VideoSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const s = Math.max(1, Math.floor(seasonNumber));
    const ep = Math.max(1, Math.floor(episodeNumber));

    return {
      type: "iframe",
      url: `${this.baseUrl}/tv/${cleanId}/${s}/${ep}`,
      providerName: this.name,
    };
  }

  /**
   * Sanitize TMDB ID to prevent injection
   */
  private sanitizeTmdbId(id: string): string | null {
    if (!id || typeof id !== "string") return null;
    const trimmed = id.trim();
    // TMDB IDs are numeric or standard alphanumeric slugs
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return null;
    }
    return trimmed;
  }
}
