import { PlaybackProvider } from "../providers/playback-provider.interface";
import { VidLinkProvider } from "../providers/vidlink.provider";
import { SuperEmbedProvider } from "../providers/superembed.provider";
import { YenimeProvider } from "../providers/yenime.provider";
import {
  isSuperSentaiSeries,
  SuperSentaiMetadataCandidate,
} from "./super-sentai.detector";
import {
  isAnimeContent,
  AnimeMetadataCandidate,
} from "./anime.detector";

import { WatchCategory } from "../types/playback.types";

export interface PlaybackRoutingContext {
  mediaType: "movie" | "tv";
  tmdbId: string;
  title?: string;
  category?: WatchCategory;
  metadata?: SuperSentaiMetadataCandidate & AnimeMetadataCandidate;
}

/**
 * Playback Router
 * Centralizes provider resolution strategy based on content type & watch category:
 *
 * Japanese Super Sentai Series:
 *   NOTE: Dedicated Toku sources (toku.fun, tokusub.net, tokustream.ovh) block iframe
 *   embedding via X-Frame-Options: sameorigin — cannot be bypassed client-side.
 *   Sentai content is served via VidLink → SuperEmbed fallback (TMDB ID supported).
 *   1. VidLinkProvider (Primary — supports TMDB ID)
 *   2. SuperEmbedProvider (Fallback)
 *
 * Anime (Japanese Animation TV & Movies):
 *   ⚠️  YenimeProvider CURRENTLY DISABLED — all sources (megaplay.buzz, yenime.net) are
 *   failing: player script broken ("urlParams is not defined") or unavailable.
 *   Anime content falls back to VidLink → SuperEmbed until Yenime sources are restored.
 *   1. VidLinkProvider (Primary)
 *   2. SuperEmbedProvider (Fallback)
 *
 *   ✅  HOW TO RE-ENABLE YenimeProvider:
 *     1. Verify megaplay.buzz or yenime.net sources are working
 *     2. Restore [this.yenimeProvider, ...] in the anime routing branches below
 *     3. Remove the @disabled marker in yenime.provider.ts
 *
 * Normal Movies & TV Series:
 *   1. VidLinkProvider (Primary)
 *   2. SuperEmbedProvider (Fallback)
 */
export class PlaybackRouter {
  constructor(
    private readonly vidlinkProvider: PlaybackProvider = new VidLinkProvider(),
    private readonly superembedProvider: PlaybackProvider = new SuperEmbedProvider(),
    private readonly yenimeProvider: PlaybackProvider = new YenimeProvider()
  ) {}

  /**
   * Determine whether current routing context is Japanese Super Sentai
   */
  isSuperSentai(context: PlaybackRoutingContext): boolean {
    if (context.category === "sentai") {
      return true;
    }
    if (context.category === "anime" || context.category === "normal") {
      return false;
    }
    if (context.mediaType !== "tv") {
      return false;
    }
    return isSuperSentaiSeries(context.tmdbId, context.metadata);
  }

  /**
   * Determine whether current routing context is Anime
   * Note: Super Sentai takes precedence and is excluded from anime routing.
   */
  isAnime(context: PlaybackRoutingContext): boolean {
    if (context.category === "anime") {
      return true;
    }
    if (context.category === "sentai" || context.category === "normal") {
      return false;
    }
    if (this.isSuperSentai(context)) {
      return false;
    }
    return isAnimeContent(context.tmdbId, {
      ...context.metadata,
      title: context.title,
    });
  }

  /**
   * Resolve ordered list of providers for the given context
   */
  resolveProviders(context: PlaybackRoutingContext): PlaybackProvider[] {
    // 1. Explicit Category Resolution

    // Sentai: Toku-specific sources block X-Frame-Options iframes.
    // Route through VidLink → SuperEmbed which support TMDB ID natively.
    if (context.category === "sentai") {
      return [this.vidlinkProvider, this.superembedProvider];
    }

    if (context.category === "anime") {
      // ⚠️ YenimeProvider disabled — sources unavailable (see class JSDoc above)
      // return [this.yenimeProvider, this.vidlinkProvider, this.superembedProvider];
      return [this.vidlinkProvider, this.superembedProvider];
    }

    if (context.category === "normal") {
      return [this.vidlinkProvider, this.superembedProvider];
    }

    // 2. Dynamic Fallback Detection
    if (this.isSuperSentai(context)) {
      return [this.vidlinkProvider, this.superembedProvider];
    }

    if (this.isAnime(context)) {
      // ⚠️ YenimeProvider disabled — sources unavailable (see class JSDoc above)
      // return [this.yenimeProvider, this.vidlinkProvider, this.superembedProvider];
      return [this.vidlinkProvider, this.superembedProvider];
    }

    // 3. Default Normal Movie / TV
    return [this.vidlinkProvider, this.superembedProvider];
  }
}
