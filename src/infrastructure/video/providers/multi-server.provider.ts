import { VideoProvider, VideoSource, VideoServerOption } from "../video.types";

/**
 * MultiServerProvider (Deprecated)
 * Provided for backward compatibility. Uses VidLink (primary) and SuperEmbed (fallback).
 */
export class MultiServerProvider implements VideoProvider {
  readonly name = "ZeflixMultiServer";

  /**
   * Generates video sources for a movie
   */
  async getMovieSource(tmdbId: string): Promise<VideoSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const servers: VideoServerOption[] = [
      {
        id: "server-vidlink",
        name: "VidLink (Primary)",
        url: `https://vidlink.pro/movie/${cleanId}?primaryColor=0096FF&secondaryColor=12151c&iconColor=ffffff&autoplay=false`,
        isDefault: true,
      },
      {
        id: "server-superembed",
        name: "SuperEmbed (Fallback)",
        url: `https://multiembed.mov/?video_id=${cleanId}&tmdb=1`,
      },
    ];

    return {
      type: "iframe",
      url: servers[0].url,
      providerName: this.name,
      servers,
    };
  }

  /**
   * Generates video sources for a TV series episode
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

    const servers: VideoServerOption[] = [
      {
        id: "server-vidlink",
        name: "VidLink (Primary)",
        url: `https://vidlink.pro/tv/${cleanId}/${s}/${ep}?primaryColor=0096FF&secondaryColor=12151c&iconColor=ffffff&autoplay=false&nextbutton=false`,
        isDefault: true,
      },
      {
        id: "server-superembed",
        name: "SuperEmbed (Fallback)",
        url: `https://multiembed.mov/?video_id=${cleanId}&s=${s}&e=${ep}&tmdb=1`,
      },
    ];

    return {
      type: "iframe",
      url: servers[0].url,
      providerName: this.name,
      servers,
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
