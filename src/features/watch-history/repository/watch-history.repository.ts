import { createServerSupabaseClient } from "@/libs/supabaseServer";
import {
  WatchHistoryMovieDto,
  WatchHistoryTVDto,
  WatchProgressDto,
} from "../watch-history.type";

/**
 * Converts a loose date string to a valid PostgreSQL DATE string (YYYY-MM-DD).
 * If the value is just a year (e.g. "2026"), it becomes "2026-01-01".
 * Returns null for anything that can't be parsed as a real date.
 */
const sanitizeDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split("T")[0];
};

// ─── Content Upsert Helpers ───

/**
 * Ensure a movie record exists in the `movies` table. Returns the internal movie_id.
 */
export const ensureMovieExistsRepository = async (payload: {
  tmdb_id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
  overview?: string | null;
}): Promise<string> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("movies")
    .upsert(
      {
        tmdb_id: payload.tmdb_id,
        title: payload.title,
        poster_path: payload.poster_path || null,
        backdrop_path: payload.backdrop_path || null,
        vote_average: payload.vote_average ?? 0,
        release_date: sanitizeDate(payload.release_date),
        overview: payload.overview || null,
      },
      { onConflict: "tmdb_id" }
    )
    .select("movie_id")
    .single();

  if (error) throw error;
  return data.movie_id;
};

/**
 * Ensure a TV show record exists. Returns the internal tv_id.
 */
export const ensureTVShowExistsRepository = async (payload: {
  tmdb_id: number;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  first_air_date?: string | null;
  overview?: string | null;
}): Promise<string> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tv_shows")
    .upsert(
      {
        tmdb_id: payload.tmdb_id,
        name: payload.name,
        poster_path: payload.poster_path || null,
        backdrop_path: payload.backdrop_path || null,
        vote_average: payload.vote_average ?? 0,
        first_air_date: sanitizeDate(payload.first_air_date),
        overview: payload.overview || null,
      },
      { onConflict: "tmdb_id" }
    )
    .select("tv_id")
    .single();

  if (error) throw error;
  return data.tv_id;
};

/**
 * Ensure a season record exists. Returns the internal season_id.
 */
export const ensureSeasonExistsRepository = async (payload: {
  tv_id: string;
  season_number: number;
}): Promise<string> => {
  const supabase = await createServerSupabaseClient();

  // Try to find existing first
  const { data: existing } = await supabase
    .from("seasons")
    .select("season_id")
    .eq("tv_id", payload.tv_id)
    .eq("season_number", payload.season_number)
    .maybeSingle();

  if (existing) return existing.season_id;

  // Insert new
  const { data, error } = await supabase
    .from("seasons")
    .insert({
      tv_id: payload.tv_id,
      season_number: payload.season_number,
      name: `Season ${payload.season_number}`,
    })
    .select("season_id")
    .single();

  if (error) throw error;
  return data.season_id;
};

/**
 * Ensure an episode record exists. Returns the internal episode_id.
 */
export const ensureEpisodeExistsRepository = async (payload: {
  season_id: string;
  episode_number: number;
  name?: string;
  still_path?: string | null;
  air_date?: string | null;
  runtime?: number | null;
}): Promise<string> => {
  const supabase = await createServerSupabaseClient();

  // Try to find existing first
  const { data: existing } = await supabase
    .from("episodes")
    .select("episode_id")
    .eq("season_id", payload.season_id)
    .eq("episode_number", payload.episode_number)
    .maybeSingle();

  if (existing) return existing.episode_id;

  // Insert new
  const { data, error } = await supabase
    .from("episodes")
    .insert({
      season_id: payload.season_id,
      episode_number: payload.episode_number,
      name: payload.name || `Episode ${payload.episode_number}`,
      still_path: payload.still_path || null,
      air_date: sanitizeDate(payload.air_date),
      runtime: payload.runtime ?? null,
    })
    .select("episode_id")
    .single();

  if (error) throw error;
  return data.episode_id;
};

// ─── Watch History Queries ───

/**
 * Upsert watch history for a movie.
 * One user + one movie = one record.
 */
export const upsertMovieHistoryRepository = async (payload: {
  user_id: string;
  movie_id: string;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
}): Promise<{ history_id: string }> => {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  // Check if record exists
  const { data: existing } = await supabase
    .from("watch_history")
    .select("history_id")
    .eq("user_id", payload.user_id)
    .eq("movie_id", payload.movie_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("watch_history")
      .update({
        progress_seconds: payload.progress_seconds,
        duration_seconds: payload.duration_seconds,
        completed: payload.completed,
        last_watched_at: now,
        updated_at: now,
      })
      .eq("history_id", existing.history_id)
      .select("history_id")
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("watch_history")
    .insert({
      user_id: payload.user_id,
      movie_id: payload.movie_id,
      progress_seconds: payload.progress_seconds,
      duration_seconds: payload.duration_seconds,
      completed: payload.completed,
      last_watched_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("history_id")
    .single();

  if (error) throw error;
  return data;
};

/**
 * Upsert watch history for a TV episode.
 * One user + one episode = one record.
 */
export const upsertEpisodeHistoryRepository = async (payload: {
  user_id: string;
  episode_id: string;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
}): Promise<{ history_id: string }> => {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  // Check if record exists
  const { data: existing } = await supabase
    .from("watch_history")
    .select("history_id")
    .eq("user_id", payload.user_id)
    .eq("episode_id", payload.episode_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("watch_history")
      .update({
        progress_seconds: payload.progress_seconds,
        duration_seconds: payload.duration_seconds,
        completed: payload.completed,
        last_watched_at: now,
        updated_at: now,
      })
      .eq("history_id", existing.history_id)
      .select("history_id")
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("watch_history")
    .insert({
      user_id: payload.user_id,
      episode_id: payload.episode_id,
      progress_seconds: payload.progress_seconds,
      duration_seconds: payload.duration_seconds,
      completed: payload.completed,
      last_watched_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("history_id")
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all movie watch history for a user, sorted by last_watched_at DESC.
 */
export const getMovieHistoryRepository = async (
  userId: string
): Promise<WatchHistoryMovieDto[]> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("watch_history")
    .select(`
      history_id,
      progress_seconds,
      duration_seconds,
      completed,
      last_watched_at,
      movies (
        tmdb_id,
        title,
        poster_path,
        backdrop_path,
        release_date
      )
    `)
    .eq("user_id", userId)
    .not("movie_id", "is", null)
    .order("last_watched_at", { ascending: false });

  if (error) throw error;

  const items: WatchHistoryMovieDto[] = [];
  for (const row of data || []) {
    const movie = row.movies as unknown as {
      tmdb_id: number;
      title: string;
      poster_path: string | null;
      backdrop_path: string | null;
      release_date: string | null;
    } | null;

    if (!movie) continue;

    items.push({
      history_id: row.history_id,
      type: "movie",
      tmdb_id: movie.tmdb_id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      progress_seconds: row.progress_seconds,
      duration_seconds: row.duration_seconds,
      completed: row.completed,
      last_watched_at: row.last_watched_at,
    });
  }

  return items;
};

/**
 * Get the latest watched episode per TV show for a user.
 * Groups by tv_show and picks the episode with the most recent last_watched_at.
 * Sorted by last_watched_at DESC.
 */
export const getTVHistoryRepository = async (
  userId: string
): Promise<WatchHistoryTVDto[]> => {
  const supabase = await createServerSupabaseClient();

  // Fetch all episode history with joined metadata
  const { data, error } = await supabase
    .from("watch_history")
    .select(`
      history_id,
      progress_seconds,
      duration_seconds,
      completed,
      last_watched_at,
      episodes (
        episode_number,
        still_path,
        seasons (
          season_number,
          tv_shows (
            tmdb_id,
            name,
            poster_path,
            backdrop_path,
            first_air_date
          )
        )
      )
    `)
    .eq("user_id", userId)
    .not("episode_id", "is", null)
    .order("last_watched_at", { ascending: false });

  if (error) throw error;

  // Group by TV show: keep only the episode with the latest last_watched_at per show
  const tvShowMap = new Map<number, WatchHistoryTVDto>();

  for (const row of data || []) {
    const episode = row.episodes as unknown as {
      episode_number: number;
      still_path: string | null;
      seasons: {
        season_number: number;
        tv_shows: {
          tmdb_id: number;
          name: string;
          poster_path: string | null;
          backdrop_path: string | null;
          first_air_date: string | null;
        };
      };
    } | null;

    if (!episode?.seasons?.tv_shows) continue;

    const tvTmdbId = episode.seasons.tv_shows.tmdb_id;

    // Since results are sorted by last_watched_at DESC,
    // the first occurrence per TV show is the latest
    if (tvShowMap.has(tvTmdbId)) continue;

    tvShowMap.set(tvTmdbId, {
      history_id: row.history_id,
      type: "tv",
      tv_tmdb_id: tvTmdbId,
      tv_name: episode.seasons.tv_shows.name,
      tv_poster_path: episode.seasons.tv_shows.poster_path,
      tv_backdrop_path: episode.seasons.tv_shows.backdrop_path,
      episode_still_path: episode.still_path,
      tv_first_air_date: episode.seasons.tv_shows.first_air_date,
      season_number: episode.seasons.season_number,
      episode_number: episode.episode_number,
      progress_seconds: row.progress_seconds,
      duration_seconds: row.duration_seconds,
      completed: row.completed,
      last_watched_at: row.last_watched_at,
    });
  }

  return Array.from(tvShowMap.values());
};

/**
 * Get saved progress for a specific movie.
 */
export const getMovieProgressRepository = async (
  userId: string,
  tmdbId: number
): Promise<WatchProgressDto | null> => {
  const supabase = await createServerSupabaseClient();

  // Find movie_id from tmdb_id
  const { data: movie } = await supabase
    .from("movies")
    .select("movie_id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (!movie) return null;

  const { data, error } = await supabase
    .from("watch_history")
    .select("progress_seconds, duration_seconds, completed")
    .eq("user_id", userId)
    .eq("movie_id", movie.movie_id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    progress_seconds: data.progress_seconds,
    duration_seconds: data.duration_seconds,
    completed: data.completed,
  };
};

/**
 * Get saved progress for a specific TV episode.
 */
export const getEpisodeProgressRepository = async (
  userId: string,
  tvTmdbId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<WatchProgressDto | null> => {
  const supabase = await createServerSupabaseClient();

  // Find tv_id
  const { data: tv } = await supabase
    .from("tv_shows")
    .select("tv_id")
    .eq("tmdb_id", tvTmdbId)
    .maybeSingle();

  if (!tv) return null;

  // Find season_id
  const { data: season } = await supabase
    .from("seasons")
    .select("season_id")
    .eq("tv_id", tv.tv_id)
    .eq("season_number", seasonNumber)
    .maybeSingle();

  if (!season) return null;

  // Find episode_id
  const { data: episode } = await supabase
    .from("episodes")
    .select("episode_id")
    .eq("season_id", season.season_id)
    .eq("episode_number", episodeNumber)
    .maybeSingle();

  if (!episode) return null;

  const { data, error } = await supabase
    .from("watch_history")
    .select("progress_seconds, duration_seconds, completed")
    .eq("user_id", userId)
    .eq("episode_id", episode.episode_id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    progress_seconds: data.progress_seconds,
    duration_seconds: data.duration_seconds,
    completed: data.completed,
  };
};

/**
 * Delete watch history for a movie or TV show.
 */
export const deleteWatchHistoryRepository = async (
  userId: string,
  historyId: string,
  target?: { type?: "movie" | "tv"; tmdbId?: number }
): Promise<boolean> => {
  const supabase = await createServerSupabaseClient();

  if (target?.type === "movie" && target.tmdbId) {
    const { data: movie } = await supabase
      .from("movies")
      .select("movie_id")
      .eq("tmdb_id", target.tmdbId)
      .maybeSingle();

    if (movie?.movie_id) {
      await supabase
        .from("watch_history")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", movie.movie_id);
      return true;
    }
  }

  if (target?.type === "tv" && target.tmdbId) {
    const { data: tv } = await supabase
      .from("tv_shows")
      .select("tv_id")
      .eq("tmdb_id", target.tmdbId)
      .maybeSingle();

    if (tv?.tv_id) {
      const { data: seasons } = await supabase
        .from("seasons")
        .select("season_id")
        .eq("tv_id", tv.tv_id);

      const seasonIds = (seasons || []).map((s) => s.season_id);
      if (seasonIds.length > 0) {
        const { data: episodes } = await supabase
          .from("episodes")
          .select("episode_id")
          .in("season_id", seasonIds);

        const episodeIds = (episodes || []).map((e) => e.episode_id);
        if (episodeIds.length > 0) {
          await supabase
            .from("watch_history")
            .delete()
            .eq("user_id", userId)
            .in("episode_id", episodeIds);
          return true;
        }
      }
    }
  }

  const { error } = await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", userId)
    .eq("history_id", historyId);

  if (error) throw error;
  return true;
};

/**
 * Clear all watch history records for a user.
 */
export const clearAllWatchHistoryRepository = async (
  userId: string
): Promise<boolean> => {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};

