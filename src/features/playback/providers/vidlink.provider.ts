import { PlaybackProvider } from "./playback-provider.interface";
import { PlaybackSource } from "../types/playback.types";

/**
 * VidLink Provider
 * Primary / default playback provider for normal movies and TV shows.
 * Communicates with VidLink player using custom player theme (#0096FF timeline).
 */
export class VidLinkProvider implements PlaybackProvider {
  readonly id = "vidlink";
  readonly name = "VidLink";
  private readonly baseUrl: string;

  constructor(baseUrl: string = "https://vidlink.pro") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Resolve movie playback source using TMDB movie ID
   */
  async getMovieSource(tmdbId: string): Promise<PlaybackSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    // Timeline played portion must be #0096FF per Zeflix player specs
    const query = new URLSearchParams({
      primaryColor: "0096FF",
      secondaryColor: "12151c",
      iconColor: "ffffff",
      autoplay: "false",
      title: "true",
      poster: "true",
    });

    const url = `${this.baseUrl}/movie/${cleanId}?${query.toString()}`;

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

    // Timeline played portion must be #0096FF per Zeflix player specs
    const query = new URLSearchParams({
      primaryColor: "0096FF",
      secondaryColor: "12151c",
      iconColor: "ffffff",
      autoplay: "false",
      nextbutton: "false",
      title: "true",
      poster: "true",
    });

    const url = `${this.baseUrl}/tv/${cleanId}/${s}/${ep}?${query.toString()}`;

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
