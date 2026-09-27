import {
  ensureMovieExistsRepository,
  ensureTVShowExistsRepository,
  ensureSeasonExistsRepository,
  ensureEpisodeExistsRepository,
  upsertMovieHistoryRepository,
  upsertEpisodeHistoryRepository,
  getMovieHistoryRepository,
  getTVHistoryRepository,
  getMovieProgressRepository,
  getEpisodeProgressRepository,
  deleteWatchHistoryRepository,
  clearAllWatchHistoryRepository,
} from "../repository/watch-history.repository";
import {
  WatchHistoryMovieDto,
  WatchHistoryTVDto,
  WatchProgressDto,
} from "../watch-history.type";
import { findTVDetailsFullFromTMDB } from "@/features/movie/repository/movie.repository";
import { calculateSeasonOffsets } from "@/features/movie/service/movie.service";

// Cache TV metadata (season offsets, total episodes, and season list) to minimize external TMDB API calls
interface TVSeasonMeta {
  season_number: number;
  episode_count: number;
}
interface TVMetadataCache {
  offsets: Map<number, number>;
  totalEpisodes: number;
  seasons: TVSeasonMeta[];
}
const tvMetadataCache = new Map<number, TVMetadataCache>();

/**
 * Service layer: calls repository functions only.
 * No direct Supabase queries.
 */

export const ensureMovieExistsService = async (payload: {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
  overview?: string | null;
}): Promise<string> => {
  return await ensureMovieExistsRepository(payload);
};

export const ensureTVShowExistsService = async (payload: {
  tmdb_id: number;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  first_air_date?: string | null;
  overview?: string | null;
}): Promise<string> => {
  return await ensureTVShowExistsRepository(payload);
};

export const ensureSeasonExistsService = async (payload: {
  tv_id: string;
  season_number: number;
}): Promise<string> => {
  return await ensureSeasonExistsRepository(payload);
};

export const ensureEpisodeExistsService = async (payload: {
  season_id: string;
  episode_number: number;
  name?: string;
  still_path?: string | null;
  air_date?: string | null;
  runtime?: number | null;
}): Promise<string> => {
  return await ensureEpisodeExistsRepository(payload);
};

export const upsertMovieHistoryService = async (payload: {
  user_id: string;
  movie_id: string;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
}): Promise<{ history_id: string }> => {
  return await upsertMovieHistoryRepository(payload);
};

export const upsertEpisodeHistoryService = async (payload: {
  user_id: string;
  episode_id: string;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
}): Promise<{ history_id: string }> => {
  return await upsertEpisodeHistoryRepository(payload);
};

export const getMovieHistoryService = async (
  userId: string
): Promise<WatchHistoryMovieDto[]> => {
  return await getMovieHistoryRepository(userId);
};

export const getTVHistoryService = async (
  userId: string
): Promise<WatchHistoryTVDto[]> => {
  const items = await getTVHistoryRepository(userId);

  // Enhance items with cumulative display_episode_number, total_episodes, and next episode routing
  await Promise.all(
    items.map(async (tvItem) => {
      // Store the individual episode completion status from DB
      const episodeWasCompleted = Boolean(tvItem.completed);
      tvItem.episode_completed = episodeWasCompleted;

      try {
        let meta = tvMetadataCache.get(tvItem.tv_tmdb_id);
        if (!meta) {
          const details = await findTVDetailsFullFromTMDB(tvItem.tv_tmdb_id);
          if (details?.seasons) {
            const offsets = calculateSeasonOffsets(details.seasons);
            const total =
              details.seasons
                .filter((s) => s.season_number > 0)
                .reduce((acc, s) => acc + (s.episode_count || 0), 0) ||
              details.number_of_episodes ||
              0;
            const validSeasons: TVSeasonMeta[] = details.seasons
              .filter((s) => s.season_number > 0)
              .map((s) => ({
                season_number: s.season_number,
                episode_count: s.episode_count || 0,
              }));
            meta = { offsets, totalEpisodes: total, seasons: validSeasons };
            tvMetadataCache.set(tvItem.tv_tmdb_id, meta);
          }
        }

        if (meta) {
          const offset = meta.offsets.get(tvItem.season_number) || 0;
          tvItem.display_episode_number = offset + tvItem.episode_number;
          tvItem.total_episodes = meta.totalEpisodes;

          // Calculate next season & next episode for automatic next-episode continue watching
          if (episodeWasCompleted) {
            const currentSeason = meta.seasons.find(
              (s) => s.season_number === tvItem.season_number
            );
            if (currentSeason && tvItem.episode_number < currentSeason.episode_count) {
              tvItem.next_season_number = tvItem.season_number;
              tvItem.next_episode_number = tvItem.episode_number + 1;
            } else {
              // Advance to next season
              const nextSeason = meta.seasons
                .filter((s) => s.season_number > tvItem.season_number && s.episode_count > 0)
                .sort((a, b) => a.season_number - b.season_number)[0];
              if (nextSeason) {
                tvItem.next_season_number = nextSeason.season_number;
                tvItem.next_episode_number = 1;
              }
            }
          }

          // Mark series as completed only if currently on the final episode and that episode was completed
          if (meta.totalEpisodes > 0) {
            tvItem.completed =
              tvItem.display_episode_number >= meta.totalEpisodes &&
              episodeWasCompleted;
          } else {
            tvItem.completed = false;
          }
          return;
        }

        tvItem.display_episode_number = tvItem.episode_number;
        tvItem.completed = false;
      } catch {
        tvItem.display_episode_number = tvItem.episode_number;
        tvItem.completed = false;
      }
    })
  );

  return items;
};

export const getMovieProgressService = async (
  userId: string,
  tmdbId: number
): Promise<WatchProgressDto | null> => {
  return await getMovieProgressRepository(userId, tmdbId);
};

export const getEpisodeProgressService = async (
  userId: string,
  tvTmdbId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<WatchProgressDto | null> => {
  return await getEpisodeProgressRepository(userId, tvTmdbId, seasonNumber, episodeNumber);
};

export const deleteWatchHistoryService = async (
  userId: string,
  historyId: string,
  target?: { type?: "movie" | "tv"; tmdbId?: number }
): Promise<boolean> => {
  return await deleteWatchHistoryRepository(userId, historyId, target);
};

export const clearAllWatchHistoryService = async (
  userId: string
): Promise<boolean> => {
  return await clearAllWatchHistoryRepository(userId);
};

