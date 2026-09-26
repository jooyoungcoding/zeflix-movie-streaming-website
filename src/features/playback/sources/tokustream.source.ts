import { SentaiSource } from "./sentai-source.interface";
import { PlaybackSource } from "../types/playback.types";

/**
 * TokuStreamSource (Source C)
 * Dedicated source adapter for TokuStream / alternate Tokusatsu streaming mirror.
 * Follows the SentaiSource interface and returns normalized PlaybackSource.
 */
export class TokuStreamSource implements SentaiSource {
  readonly id = "tokustream";
  readonly name = "TokuStream";
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.TOKUSTREAM_URL || "https://tokustream.ovh"
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Resolve movie playback source for TokuStream (Source C)
   */
  async resolveMovie(
    tmdbId: string,
    title?: string,
    _metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    void _metadata;
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const url = `${this.baseUrl}/movie/${cleanId}`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        source: this.id,
        sourceTag: "Source C",
        franchise: "Super Sentai",
        language: "en",
        tmdbId: cleanId,
        title: title || "",
      },
    };
  }

  /**
   * Resolve TV episode playback source for TokuStream (Source C)
   */
  async resolveEpisode(
    tmdbId: string,
    season: number,
    episode: number,
    title?: string,
    _metadata?: Record<string, unknown>
  ): Promise<PlaybackSource | null> {
    void _metadata;
    const cleanId = this.sanitizeTmdbId(tmdbId);
    if (!cleanId) return null;

    const s = Math.max(1, Math.floor(season || 1));
    const ep = Math.max(1, Math.floor(episode || 1));

    const url = `${this.baseUrl}/tv/${cleanId}/${s}/${ep}`;

    return {
      type: "iframe",
      url,
      providerId: this.id,
      providerName: this.name,
      customData: {
        source: this.id,
        sourceTag: "Source C",
        franchise: "Super Sentai",
        language: "en",
        tmdbId: cleanId,
        season: s,
        episode: ep,
        title: title || "",
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
