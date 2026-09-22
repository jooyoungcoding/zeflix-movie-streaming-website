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
} from "../repository/watchlist.repository";
import { AddToWatchlistData, MediaPayload, WatchlistItemDto } from "../watchlist.type";

export const getWatchlistByUserIdService = async (
  userId: string
): Promise<WatchlistItemDto[]> => {
  return await getWatchlistByUserIdRepository(userId);
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
