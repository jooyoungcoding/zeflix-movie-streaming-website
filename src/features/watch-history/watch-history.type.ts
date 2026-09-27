/**
 * Watch History Feature Types
 *
 * Provider-independent watch history types.
 * Does NOT store any provider URL, server number, or provider-specific ID.
 */

// ─── Request Types ───

export interface UpsertWatchProgressRequest {
  type: "movie" | "tv";
  tmdb_id: number;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;

  // Movie metadata (required when type = "movie")
  title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
  overview?: string | null;

  // TV episode metadata (required when type = "tv")
  tv_tmdb_id?: number;
  tv_name?: string;
  tv_poster_path?: string | null;
  tv_backdrop_path?: string | null;
  tv_first_air_date?: string | null;
  tv_vote_average?: number;
  tv_overview?: string | null;

  season_number?: number;
  episode_number?: number;
  display_episode_number?: number;
  episode_name?: string;
  episode_still_path?: string | null;
  episode_air_date?: string | null;
  episode_runtime?: number | null;
}

export interface GetProgressRequest {
  type: "movie" | "tv";
  tmdb_id: number;
  season_number?: number;
  episode_number?: number;
}

// ─── Response Types ───

export interface WatchHistoryMovieDto {
  history_id: string;
  type: "movie";
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date: string | null;
  progress_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  last_watched_at: string;
}

export interface WatchHistoryTVDto {
  history_id: string;
  type: "tv";
  tv_tmdb_id: number;
  tv_name: string;
  tv_poster_path: string | null;
  tv_backdrop_path?: string | null;
  episode_still_path?: string | null;
  tv_first_air_date: string | null;
  season_number: number;
  episode_number: number;
  display_episode_number?: number;
  total_episodes?: number;
  next_season_number?: number;
  next_episode_number?: number;
  progress_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  episode_completed?: boolean;
  last_watched_at: string;
}

export type WatchHistoryItemDto = WatchHistoryMovieDto | WatchHistoryTVDto;

export interface WatchHistoryResponse {
  success: boolean;
  data: WatchHistoryItemDto[];
}

export interface WatchProgressDto {
  progress_seconds: number;
  duration_seconds: number | null;
  completed: boolean;
  season_number?: number;
  episode_number?: number;
}

export interface WatchProgressResponse {
  success: boolean;
  data: WatchProgressDto | null;
}

export interface UpsertWatchProgressResponse {
  success: boolean;
  data?: { history_id: string };
}
