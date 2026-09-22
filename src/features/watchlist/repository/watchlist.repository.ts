import { createServerSupabaseClient } from "@/libs/supabaseServer";
import {
  AddToWatchlistData,
  MediaPayload,
  WatchlistItemDto,
  WatchlistMovieItem,
  WatchlistTVItem,
} from "../watchlist.type";

export const getWatchlistByUserIdRepository = async (
  userId: string
): Promise<WatchlistItemDto[]> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("watchlists")
    .select(`
      watchlist_id,
      created_at,
      movie_id,
      tv_id,
      movies (
        movie_id,
        tmdb_id,
        title,
        poster_path,
        backdrop_path,
        vote_average,
        release_date,
        overview
      ),
      tv_shows (
        tv_id,
        tmdb_id,
        name,
        poster_path,
        backdrop_path,
        vote_average,
        first_air_date,
        overview
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const items: WatchlistItemDto[] = [];

  for (const raw of data || []) {
    const movie = raw.movies as unknown as WatchlistMovieItem | null;
    const tv = raw.tv_shows as unknown as WatchlistTVItem | null;

    if (movie && raw.movie_id) {
      items.push({
        watchlist_id: raw.watchlist_id,
        created_at: raw.created_at,
        type: "movie",
        content: {
          id: movie.movie_id,
          tmdb_id: movie.tmdb_id,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: Number(movie.vote_average) || 0,
          release_date: movie.release_date,
          overview: movie.overview,
        },
      });
    } else if (tv && raw.tv_id) {
      items.push({
        watchlist_id: raw.watchlist_id,
        created_at: raw.created_at,
        type: "tv",
        content: {
          id: tv.tv_id,
          tmdb_id: tv.tmdb_id,
          title: tv.name,
          poster_path: tv.poster_path,
          backdrop_path: tv.backdrop_path,
          vote_average: Number(tv.vote_average) || 0,
          release_date: tv.first_air_date,
          overview: tv.overview,
        },
      });
    }
  }

  return items;
};

export const findMovieByTmdbIdRepository = async (
  tmdbId: number
): Promise<{ movie_id: string } | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("movies")
    .select("movie_id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

export const findTVByTmdbIdRepository = async (
  tmdbId: number
): Promise<{ tv_id: string } | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tv_shows")
    .select("tv_id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Converts a loose date string to a valid PostgreSQL DATE string (YYYY-MM-DD).
 * If the value is just a year (e.g. "2026"), it becomes "2026-01-01".
 * Returns null for anything that can't be parsed as a real date.
 */
const sanitizeDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  // Bare year: "2026" → "2026-01-01"
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
  // Already a valid full date: "2026-09-22"
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // Anything else — let PostgreSQL decide, but fall back to null on NaN
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split("T")[0];
};

export const upsertMovieForWatchlistRepository = async (
  payload: MediaPayload
): Promise<string> => {
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

  if (error) {
    throw error;
  }

  return data.movie_id;
};

export const upsertTVForWatchlistRepository = async (
  payload: MediaPayload
): Promise<string> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("tv_shows")
    .upsert(
      {
        tmdb_id: payload.tmdb_id,
        name: payload.title,
        poster_path: payload.poster_path || null,
        backdrop_path: payload.backdrop_path || null,
        vote_average: payload.vote_average ?? 0,
        first_air_date: sanitizeDate(payload.release_date),
        overview: payload.overview || null,
      },
      { onConflict: "tmdb_id" }
    )
    .select("tv_id")
    .single();

  if (error) {
    throw error;
  }

  return data.tv_id;
};

export const findWatchlistRecordRepository = async (
  userId: string,
  target: { movieId?: string | null; tvId?: string | null }
): Promise<{ watchlist_id: string } | null> => {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("watchlists").select("watchlist_id").eq("user_id", userId);

  if (target.movieId) {
    query = query.eq("movie_id", target.movieId);
  } else if (target.tvId) {
    query = query.eq("tv_id", target.tvId);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  return data;
};

export const insertWatchlistRepository = async (
  data: AddToWatchlistData
): Promise<{ watchlist_id: string }> => {
  const supabase = await createServerSupabaseClient();
  const { data: result, error } = await supabase
    .from("watchlists")
    .insert({
      user_id: data.userId,
      movie_id: data.movieId || null,
      tv_id: data.tvId || null,
    })
    .select("watchlist_id")
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const deleteWatchlistRepository = async (
  userId: string,
  target: { movieId?: string | null; tvId?: string | null }
): Promise<boolean> => {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("watchlists").delete().eq("user_id", userId);

  if (target.movieId) {
    query = query.eq("movie_id", target.movieId);
  } else if (target.tvId) {
    query = query.eq("tv_id", target.tvId);
  } else {
    return false;
  }

  const { error } = await query;
  if (error) {
    throw error;
  }

  return true;
};

export const deleteWatchlistByIdRepository = async (
  userId: string,
  watchlistId: string
): Promise<boolean> => {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("watchlist_id", watchlistId);

  if (error) {
    throw error;
  }

  return true;
};
