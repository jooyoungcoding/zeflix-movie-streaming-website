import { VideoProvider, VideoSource, VideoServerOption } from "../video.types";

/**
 * MultiServerProvider Implementation
 * Provides clean primary playback stream (VidLink with Emerald Zeflix theme)
 * and alternative fallback servers for maximum reliability.
 */
export class MultiServerProvider implements VideoProvider {
  readonly name = "ZeflixMultiServer";

  /**
   * Generates multi-server video sources for a movie
   */
  async getMovieSource(tmdbId: string): Promise<VideoSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const servers: VideoServerOption[] = [
      {
        id: "server-vidlink",
        name: "Server 1",
        url: `https://vidlink.pro/movie/${cleanId}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=false`,
        isDefault: true,
      },
      {
        id: "server-vidsrc-cc",
        name: "Server 2",
        url: `https://vidsrc.cc/v2/embed/movie/${cleanId}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=false`,
      },
      {
        id: "server-autoembed",
        name: "Server 3",
        url: `https://player.autoembed.cc/embed/movie/${cleanId}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=false`,
      },
      {
        id: "server-vidsrc-to",
        name: "Server 4",
        url: `https://vidsrc.to/embed/movie/${cleanId}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=false`,
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
   * Generates multi-server video sources for a TV series episode
   */
  async getEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    hasNextEpisode: boolean = true
  ): Promise<VideoSource | null> {
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const s = Math.max(1, Math.floor(seasonNumber));
    const ep = Math.max(1, Math.floor(episodeNumber));
    const nextBtnParam = hasNextEpisode ? "nextbutton=true" : "nextbutton=false";

    const servers: VideoServerOption[] = [
      {
        id: "server-vidlink",
        name: "Server 1",
        url: `https://vidlink.pro/tv/${cleanId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true&nextbutton=false`,
        isDefault: true,
      },
      {
        id: "server-vidsrc-cc",
        name: "Server 2",
        url: `https://vidsrc.cc/v2/embed/tv/${cleanId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true`,
      },
      {
        id: "server-autoembed",
        name: "Server 3",
        url: `https://player.autoembed.cc/embed/tv/${cleanId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true`,
      },
      {
        id: "server-vidsrc-to",
        name: "Server 4",
        url: `https://vidsrc.to/embed/tv/${cleanId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true`,
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
   * Sanitize TMDB ID to prevent arbitrary URL injection
   */
  private sanitizeTmdbId(id: string): string | null {
    if (!id || typeof id !== "string") return null;
    const trimmed = id.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return null;
    }
    return trimmed;
  }
}
