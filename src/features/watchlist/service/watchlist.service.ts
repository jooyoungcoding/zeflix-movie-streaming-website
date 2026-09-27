import {
  getWatchlistByUserIdRepository,
  findMovieByTmdbIdRepository,
  findTVByTmdbIdRepository,
  upsertMovieForWatchlistRepository,
  upsertTVForWatchlistRepository,
  findWatchlistRecordRepository,
  insertWatchlistRepository,
  deleteWatchlistRepository,
  deleteWatchlistByIdRepository,
  clearAllWatchlistByUserIdRepository,
} from "../repository/watchlist.repository";
import { AddToWatchlistData, MediaPayload, WatchlistItemDto } from "../watchlist.type";

import {
  findMovieDetailsFullFromTMDB,
  findTVDetailsFullFromTMDB,
} from "@/features/movie/repository/movie.repository";

interface WatchlistMediaCache {
  genres: string[];
  season?: string;
}
const mediaCache = new Map<string, WatchlistMediaCache>();

export const getWatchlistByUserIdService = async (
  userId: string
): Promise<WatchlistItemDto[]> => {
  const items = await getWatchlistByUserIdRepository(userId);

  await Promise.all(
    items.map(async (item) => {
      const cacheKey = `${item.type}_${item.content.tmdb_id}`;
      const cached = mediaCache.get(cacheKey);
      if (cached) {
        item.content.genres = cached.genres;
        item.content.season = cached.season;
        return;
      }

      try {
        if (item.type === "movie") {
          const details = await findMovieDetailsFullFromTMDB(item.content.tmdb_id);
          const genres = (details?.genres || []).map((g) => g.name).filter(Boolean);
          item.content.genres = genres;
          mediaCache.set(cacheKey, { genres });
        } else {
          const details = await findTVDetailsFullFromTMDB(item.content.tmdb_id);
          const genres = (details?.genres || []).map((g) => g.name).filter(Boolean);
          const seasonCount =
            (details?.seasons || []).filter((s) => s.season_number > 0).length || 1;
          const season = `${seasonCount}S`;
          item.content.genres = genres;
          item.content.season = season;
          mediaCache.set(cacheKey, { genres, season });
        }
      } catch {
        item.content.genres = [];
        item.content.season = "1S";
      }
    })
  );

  return items;
};

export const findMovieByTmdbIdService = async (
  tmdbId: number
): Promise<{ movie_id: string } | null> => {
  return await findMovieByTmdbIdRepository(tmdbId);
};

export const findTVByTmdbIdService = async (
  tmdbId: number
): Promise<{ tv_id: string } | null> => {
  return await findTVByTmdbIdRepository(tmdbId);
};

export const ensureMovieInDBService = async (
  payload: MediaPayload
): Promise<string> => {
  return await upsertMovieForWatchlistRepository(payload);
};

export const ensureTVInDBService = async (
  payload: MediaPayload
): Promise<string> => {
  return await upsertTVForWatchlistRepository(payload);
};

export const checkWatchlistRecordService = async (
  userId: string,
  target: { movieId?: string | null; tvId?: string | null }
): Promise<{ watchlist_id: string } | null> => {
  return await findWatchlistRecordRepository(userId, target);
};

export const insertWatchlistService = async (
  data: AddToWatchlistData
): Promise<{ watchlist_id: string }> => {
  return await insertWatchlistRepository(data);
};

export const removeWatchlistService = async (
  userId: string,
  target: { movieId?: string | null; tvId?: string | null }
): Promise<boolean> => {
  return await deleteWatchlistRepository(userId, target);
};

export const removeWatchlistByIdService = async (
  userId: string,
  watchlistId: string
): Promise<boolean> => {
  return await deleteWatchlistByIdRepository(userId, watchlistId);
};

export const clearAllWatchlistService = async (
  userId: string
): Promise<boolean> => {
  return await clearAllWatchlistByUserIdRepository(userId);
};
