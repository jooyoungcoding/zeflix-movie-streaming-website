import { VideoProvider, VideoSource } from "./video.types";
import { defaultPlaybackService } from "@/features/playback/service/playback.service";

/**
 * Video Service - Backward-compatible facade for Zeflix streaming architecture
 * Delegates to the centralized PlaybackService.
 */
export class VideoService {
  private activeProviderName: string = "ZeflixPlaybackEngine";

  constructor(_provider?: VideoProvider) {
    void _provider;
    // Deprecated provider param kept for signature compatibility
  }

  /**
   * Set or swap active video provider at runtime (deprecated facade)
   */
  setProvider(provider: VideoProvider): void {
    this.activeProviderName = provider.name;
  }

  /**
   * Get current active provider name
   */
  getProviderName(): string {
    return this.activeProviderName;
  }

  /**
   * Resolve movie video source via PlaybackService
   */
  async getMovieSource(tmdbId: string): Promise<VideoSource | null> {
    if (!tmdbId || typeof tmdbId !== "string") {
      return null;
    }
    const session = await defaultPlaybackService.getMoviePlayback(tmdbId.trim());
    const primary = session.sources[0];
    if (!primary) return null;

    return {
      type: primary.type,
      url: primary.url,
      providerName: primary.providerName,
      title: session.mediaInfo.title,
    };
  }

  /**
   * Resolve TV episode video source via PlaybackService
   */
  async getEpisodeSource(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    _hasNextEpisode: boolean = true
  ): Promise<VideoSource | null> {
    void _hasNextEpisode;
    if (!tmdbId || typeof tmdbId !== "string") {
      return null;
    }
    if (isNaN(seasonNumber) || seasonNumber < 1) {
      return null;
    }
    if (isNaN(episodeNumber) || episodeNumber < 1) {
      return null;
    }

    const session = await defaultPlaybackService.getTvPlayback(
      tmdbId.trim(),
      seasonNumber,
      episodeNumber
    );
    const primary = session.sources[0];
    if (!primary) return null;

    return {
      type: primary.type,
      url: primary.url,
      providerName: primary.providerName,
      title: session.mediaInfo.title,
    };
  }
}

// Singleton instance for application-wide usage
export const defaultVideoService = new VideoService();
