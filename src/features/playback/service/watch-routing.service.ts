import { WatchCategory } from "../types/playback.types";
import { isSuperSentaiSeries } from "./super-sentai.detector";
import { isAnimeContent } from "./anime.detector";

export interface MediaCategoryCandidate {
  tmdbId?: string | number;
  title?: string;
  originalName?: string;
  genres?: string[] | Array<{ id?: number; name?: string }>;
  productionCompanyIds?: number[];
  keywordIds?: number[];
  originCountry?: string[];
  productionCountries?: string[];
  originalLanguage?: string;
  franchise?: string;
  mediaType?: "movie" | "tv";
  [key: string]: unknown;
}

/**
 * Centralized Category Resolver for Watch URLs & Playback Flow
 *
 * Evaluation Priority:
 * 1. Super Sentai / Tokusatsu:
 *    - TMDB ID registry or franchise/keywords/origin
 * 2. Anime:
 *    - TMDB Anime registry or Japanese Animation genres/origin
 * 3. Normal Content:
 *    - Default fallback for all standard western/international movies & TV shows
 */
export function determineWatchCategory(
  media: MediaCategoryCandidate
): WatchCategory {
  // 1. Sentai check
  if (isSuperSentaiSeries(media.tmdbId || "", media)) {
    return "sentai";
  }

  // 2. Anime check
  if (isAnimeContent(media.tmdbId || "", media)) {
    return "anime";
  }

  // 3. Normal content
  return "normal";
}

export interface BuildWatchUrlParams {
  type: "movie" | "tv";
  tmdbId: string | number;
  category?: WatchCategory;
  season?: number;
  episode?: number;
  media?: MediaCategoryCandidate;
}

/**
 * Generates the standardized category-based Watch URL:
 * - Movie Anime: /watch/movie/anime/[id]
 * - TV Anime: /watch/tv/anime/[id]/[season]/[episode]
 * - Movie Sentai: /watch/movie/sentai/[id]
 * - TV Sentai: /watch/tv/sentai/[id]/[season]/[episode]
 * - Normal Movie: /watch/movie/normal/[id]
 * - Normal TV: /watch/tv/normal/[id]/[season]/[episode]
 */
export function buildWatchUrl(params: BuildWatchUrlParams): string {
  const cleanId = String(params.tmdbId || "").trim();
  const category: WatchCategory =
    params.category ||
    (params.media ? determineWatchCategory(params.media) : "normal");

  if (params.type === "movie") {
    return `/watch/movie/${category}/${cleanId}`;
  }

  const ep = Math.max(1, Math.floor(params.episode || 1));
  const s = params.season !== undefined ? Math.floor(params.season) : 1;
  if (s > 1) {
    return `/watch/tv/${category}/${cleanId}/${s}/${ep}`;
  }
  return `/watch/tv/${category}/${cleanId}/${ep}`;
}

/**
 * Constructs Next Episode Watch URL while strictly preserving content category
 */
export function buildNextEpisodeUrl(
  category: WatchCategory,
  tmdbId: string | number,
  nextEpisode: number,
  season: number = 1
): string {
  const cleanId = String(tmdbId || "").trim();
  const s = Math.max(1, Math.floor(season || 1));
  const ep = Math.max(1, Math.floor(nextEpisode || 1));
  if (s > 1) {
    return `/watch/tv/${category}/${cleanId}/${s}/${ep}`;
  }
  return `/watch/tv/${category}/${cleanId}/${ep}`;
}
