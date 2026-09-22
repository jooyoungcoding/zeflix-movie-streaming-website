import { VideoProvider, VideoSource } from "./video.types";
import { MultiServerProvider } from "./providers/multi-server.provider";

/**
 * Video Service - Centralized video playback resolution layer
 * Orchestrates video providers and manages source generation
 */
export class VideoService {
  private activeProvider: VideoProvider;

  constructor(provider?: VideoProvider) {
    // Default to clean MultiServerProvider (VidLink + Fallbacks)
    this.activeProvider = provider || new MultiServerProvider();
  }

  /**
   * Set or swap active video provider at runtime
   */
  setProvider(provider: VideoProvider): void {
    this.activeProvider = provider;
  }

  /**
   * Get current active provider name
   */
  getProviderName(): string {
    return this.activeProvider.name;
  }

  /**
   * Resolve movie video source
   */
  async getMovieSource(tmdbId: string): Promise<VideoSource | null> {
    if (!tmdbId || typeof tmdbId !== "string") {
      return null;
    }
    return this.activeProvider.getMovieSource(tmdbId.trim());
  }

  /**
   * Resolve TV episode video source
   */
  async getEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    hasNextEpisode: boolean = true
  ): Promise<VideoSource | null> {
    if (!tmdbId || typeof tmdbId !== "string") {
      return null;
    }
    if (isNaN(seasonNumber) || seasonNumber < 1) {
      return null;
    }
    if (isNaN(episodeNumber) || episodeNumber < 1) {
      return null;
    }

    return this.activeProvider.getEpisodeSource(
      tmdbId.trim(),
      seasonNumber,
      episodeNumber,
      hasNextEpisode
    );
  }
}

// Singleton instance for application-wide usage
export const defaultVideoService = new VideoService();
