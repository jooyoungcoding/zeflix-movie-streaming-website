import { getCurrentUserService } from "@/features/auth/service/auth.service";
import {
  getWatchlistByUserIdService,
  findMovieByTmdbIdService,
  findTVByTmdbIdService,
  ensureMovieInDBService,
  ensureTVInDBService,
  checkWatchlistRecordService,
  insertWatchlistService,
  removeWatchlistService,
  removeWatchlistByIdService,
} from "../service/watchlist.service";
import { ToggleWatchlistRequest, WatchlistItemDto } from "../watchlist.type";

export const getUserWatchlistController = async (): Promise<WatchlistItemDto[]> => {
  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await getWatchlistByUserIdService(currentUser.user.id);
};

export const toggleWatchlistController = async (
  input: ToggleWatchlistRequest
): Promise<{ isAdded: boolean; watchlist_id?: string }> => {
  if (!input.tmdb_id || typeof input.tmdb_id !== "number" || input.tmdb_id <= 0) {
    throw new Error("Valid tmdb_id is required");
  }

  if (!input.type || !["movie", "tv"].includes(input.type)) {
    throw new Error("Valid media type ('movie' or 'tv') is required");
  }

  if (!input.title || typeof input.title !== "string" || !input.title.trim()) {
    throw new Error("Title is required");
  }

  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = currentUser.user.id;

  // 1. Ensure movie / tv record exists in Supabase DB to get the internal UUID
  let internalMovieId: string | null = null;
  let internalTvId: string | null = null;

  if (input.type === "movie") {
    internalMovieId = await ensureMovieInDBService({
      tmdb_id: input.tmdb_id,
      type: "movie",
      title: input.title.trim(),
      poster_path: input.poster_path,
      backdrop_path: input.backdrop_path,
      vote_average: input.vote_average,
      release_date: input.release_date,
      overview: input.overview,
    });
  } else {
    internalTvId = await ensureTVInDBService({
      tmdb_id: input.tmdb_id,
      type: "tv",
      title: input.title.trim(),
      poster_path: input.poster_path,
      backdrop_path: input.backdrop_path,
      vote_average: input.vote_average,
      release_date: input.release_date,
      overview: input.overview,
    });
  }

  // 2. Check if already in watchlist
  const existingRecord = await checkWatchlistRecordService(userId, {
    movieId: internalMovieId,
    tvId: internalTvId,
  });

  const shouldRemove =
    input.action === "remove" ||
    (input.action === undefined && existingRecord !== null);

  if (shouldRemove) {
    if (existingRecord) {
      await removeWatchlistService(userId, {
        movieId: internalMovieId,
        tvId: internalTvId,
      });
    }
    return { isAdded: false };
  } else {
    if (existingRecord) {
      return { isAdded: true, watchlist_id: existingRecord.watchlist_id };
    }

    const created = await insertWatchlistService({
      userId,
      movieId: internalMovieId,
      tvId: internalTvId,
    });

    return { isAdded: true, watchlist_id: created.watchlist_id };
  }
};

export const checkWatchlistStatusController = async (
  tmdbId: number,
  type: "movie" | "tv"
): Promise<{ isAdded: boolean; watchlist_id?: string }> => {
  if (!tmdbId || isNaN(tmdbId)) {
    throw new Error("Valid tmdb_id is required");
  }

  if (!type || !["movie", "tv"].includes(type)) {
    throw new Error("Valid media type is required");
  }

  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    return { isAdded: false };
  }

  const userId = currentUser.user.id;

  if (type === "movie") {
    const movie = await findMovieByTmdbIdService(tmdbId);
    if (!movie) return { isAdded: false };

    const record = await checkWatchlistRecordService(userId, {
      movieId: movie.movie_id,
    });
    return { isAdded: !!record, watchlist_id: record?.watchlist_id };
  } else {
    const tv = await findTVByTmdbIdService(tmdbId);
    if (!tv) return { isAdded: false };

    const record = await checkWatchlistRecordService(userId, {
      tvId: tv.tv_id,
    });
    return { isAdded: !!record, watchlist_id: record?.watchlist_id };
  }
};

export const deleteWatchlistByIdController = async (
  watchlistId: string
): Promise<{ success: boolean }> => {
  if (!watchlistId || typeof watchlistId !== "string") {
    throw new Error("Watchlist ID is required");
  }

  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  await removeWatchlistByIdService(currentUser.user.id, watchlistId);
  return { success: true };
};
