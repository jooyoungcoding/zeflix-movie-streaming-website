import { SentaiSource } from "./sentai-source.interface";
import { PlaybackSource } from "../types/playback.types";

/**
 * TokuAddonSource
 * Dedicated source adapter for TokuAddon Tokusatsu streaming.
 * Follows the SentaiSource interface and returns normalized PlaybackSource.
 */
export class TokuAddonSource implements SentaiSource {
  readonly id = "tokuaddon";
  readonly name = "TokuAddon";
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.TOKUADDON_STREAM_URL || "https://hub.roxxy-tech.com"
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Resolve movie playback source for TokuAddon
   */
  async resolveMovie(
    tmdbId: string,
    _title?: string,
    _metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    void _title;
    void _metadata;
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    // TokuAddon streaming endpoint for Tokusatsu movie playback
    const url = `${this.baseUrl}/stream/movie/${cleanId}.json`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        source: this.id,
        franchise: "Super Sentai",
        language: "en",
        tmdbId: cleanId,
      },
    };
  }

  /**
   * Resolve TV episode playback source for TokuAddon
   */
  async resolveEpisode(
    tmdbId: string,
    season: number,
    episode: number,
    _title?: string,
    _metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    void _title;
    void _metadata;
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const s = Math.max(1, Math.floor(season || 1));
    const ep = Math.max(1, Math.floor(episode || 1));

    // TokuAddon streaming endpoint for Tokusatsu TV series (Stremio format: {tmdbId}:{season}:{episode})
    const url = `${this.baseUrl}/stream/series/${cleanId}:${s}:${ep}.json`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        source: this.id,
        franchise: "Super Sentai",
        language: "en",
        tmdbId: cleanId,
        season: s,
        episode: ep,
      },
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
