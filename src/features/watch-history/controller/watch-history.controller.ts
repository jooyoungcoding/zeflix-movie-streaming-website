import { getCurrentUserService } from "@/features/auth/service/auth.service";
import {
  ensureMovieExistsService,
  ensureTVShowExistsService,
  ensureSeasonExistsService,
  ensureEpisodeExistsService,
  upsertMovieHistoryService,
  upsertEpisodeHistoryService,
  getMovieHistoryService,
  getTVHistoryService,
  getMovieProgressService,
  getEpisodeProgressService,
  deleteWatchHistoryService,
  clearAllWatchHistoryService,
} from "../service/watch-history.service";
import {
  UpsertWatchProgressRequest,
  GetProgressRequest,
  WatchHistoryItemDto,
  WatchProgressDto,
} from "../watch-history.type";

/**
 * Controller: validation, auth checks, business logic decisions.
 * No direct Supabase queries.
 */

/**
 * Get the authenticated user's full watch history (movies + latest TV episodes).
 * Merged and sorted by last_watched_at DESC.
 */
export const getWatchHistoryController = async (): Promise<WatchHistoryItemDto[]> => {
  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = currentUser.user.id;

  // Fetch movie and TV history in parallel
  const [movieHistory, tvHistory] = await Promise.all([
    getMovieHistoryService(userId),
    getTVHistoryService(userId),
  ]);

  // Merge and sort by last_watched_at DESC
  const merged: WatchHistoryItemDto[] = [...movieHistory, ...tvHistory];
  merged.sort(
    (a, b) =>
      new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime()
  );

  return merged;
};

/**
 * Get saved progress for a specific movie or episode.
 */
export const getProgressController = async (
  input: GetProgressRequest
): Promise<WatchProgressDto | null> => {
  if (!input.tmdb_id || typeof input.tmdb_id !== "number" || input.tmdb_id <= 0) {
    throw new Error("Valid tmdb_id is required");
  }

  if (!input.type || !["movie", "tv"].includes(input.type)) {
    throw new Error("Valid type ('movie' or 'tv') is required");
  }

  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    // Not authenticated — return null (no saved progress)
    return null;
  }

  const userId = currentUser.user.id;

  if (input.type === "movie") {
    return await getMovieProgressService(userId, input.tmdb_id);
  }

  // TV episode: if season & episode specified, get specific episode progress
  if (input.season_number && input.episode_number) {
    const epProgress = await getEpisodeProgressService(
      userId,
      input.tmdb_id,
      input.season_number,
      input.episode_number
    );
    if (!epProgress) return null;
    return {
      ...epProgress,
      season_number: input.season_number,
      episode_number: input.episode_number,
      episode_completed: epProgress.completed,
    };
  }

  // Otherwise, get latest watched episode progress for this TV show
  const tvHistory = await getTVHistoryService(userId);
  const match = tvHistory.find((item) => item.tv_tmdb_id === input.tmdb_id);
  if (!match) return null;

  return {
    progress_seconds: match.progress_seconds,
    duration_seconds: match.duration_seconds,
    completed: match.completed,
    episode_completed: match.episode_completed,
    season_number: match.season_number,
    episode_number: match.episode_number,
    next_season_number: match.next_season_number,
    next_episode_number: match.next_episode_number,
  };
};

/**
 * Create or update playback progress.
 * Ensures content records exist before creating the history FK.
 */
export const upsertProgressController = async (
  input: UpsertWatchProgressRequest
): Promise<{ history_id: string }> => {
  // ─── Validation ───
  if (!input.type || !["movie", "tv"].includes(input.type)) {
    throw new Error("Valid type ('movie' or 'tv') is required");
  }

  if (!input.tmdb_id || typeof input.tmdb_id !== "number" || input.tmdb_id <= 0) {
    throw new Error("Valid tmdb_id is required");
  }

  if (typeof input.progress_seconds !== "number" || input.progress_seconds < 0) {
    throw new Error("Valid progress_seconds is required");
  }

  if (typeof input.duration_seconds !== "number" || input.duration_seconds < 0) {
    throw new Error("Valid duration_seconds is required");
  }

  // ─── Authentication ───
  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = currentUser.user.id;

  // ─── Completion logic: 180-second threshold ───
  const COMPLETION_THRESHOLD = 180;
  let { progress_seconds, completed } = input;
  const { duration_seconds } = input;

  if (
    duration_seconds > 0 &&
    duration_seconds - progress_seconds <= COMPLETION_THRESHOLD
  ) {
    completed = true;
    progress_seconds = duration_seconds;
  }

  // ─── Movie ───
  if (input.type === "movie") {
    if (!input.title) {
      throw new Error("Title is required for movies");
    }

    // Ensure movie record exists in DB
    const movieId = await ensureMovieExistsService({
      tmdb_id: input.tmdb_id,
      title: input.title,
      poster_path: input.poster_path,
      backdrop_path: input.backdrop_path,
      vote_average: input.vote_average,
      release_date: input.release_date,
      overview: input.overview,
    });

    return await upsertMovieHistoryService({
      user_id: userId,
      movie_id: movieId,
      progress_seconds,
      duration_seconds,
      completed,
    });
  }

  // ─── TV Episode ───
  if (!input.tv_tmdb_id || !input.tv_name) {
    throw new Error("tv_tmdb_id and tv_name are required for TV");
  }

  if (!input.season_number || !input.episode_number) {
    throw new Error("season_number and episode_number are required for TV");
  }

  // Ensure TV show exists
  const tvId = await ensureTVShowExistsService({
    tmdb_id: input.tv_tmdb_id,
    name: input.tv_name,
    poster_path: input.tv_poster_path,
    backdrop_path: input.tv_backdrop_path,
    vote_average: input.tv_vote_average,
    first_air_date: input.tv_first_air_date,
    overview: input.tv_overview,
  });

  // Ensure season exists
  const seasonId = await ensureSeasonExistsService({
    tv_id: tvId,
    season_number: input.season_number,
  });

  // Ensure episode exists
  const episodeId = await ensureEpisodeExistsService({
    season_id: seasonId,
    episode_number: input.episode_number,
    name: input.episode_name,
    still_path: input.episode_still_path,
    air_date: input.episode_air_date,
    runtime: input.episode_runtime,
  });

  return await upsertEpisodeHistoryService({
    user_id: userId,
    episode_id: episodeId,
    progress_seconds,
    duration_seconds,
    completed,
  });
};

/**
 * Delete an item from watch history.
 */
export const deleteWatchHistoryController = async (
  historyId: string,
  target?: { type?: "movie" | "tv"; tmdbId?: number }
): Promise<boolean> => {
  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = currentUser.user.id;
  return await deleteWatchHistoryService(userId, historyId, target);
};

/**
 * Clear all watch history for the authenticated user.
 */
export const clearAllWatchHistoryController = async (): Promise<boolean> => {
  const currentUser = await getCurrentUserService();
  if (!currentUser?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = currentUser.user.id;
  return await clearAllWatchHistoryService(userId);
};

