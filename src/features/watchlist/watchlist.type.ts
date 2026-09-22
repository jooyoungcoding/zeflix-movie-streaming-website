import { WatchList } from "@/types/WatchLists";

export type WatchlistRecord = WatchList;

export interface MediaPayload {
  tmdb_id: number;
  type: "movie" | "tv";
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  overview?: string;
}

export interface ToggleWatchlistRequest extends MediaPayload {
  action?: "add" | "remove";
}

export interface AddToWatchlistData {
  userId: string;
  movieId?: string | null;
  tvId?: string | null;
}

export interface WatchlistMovieItem {
  movie_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  overview: string | null;
}

export interface WatchlistTVItem {
  tv_id: string;
  tmdb_id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string | null;
  overview: string | null;
}

export interface WatchlistItemDto {
  watchlist_id: string;
  created_at: string;
  type: "movie" | "tv";
  content: {
    id: string; // internal UUID (movie_id or tv_id)
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date: string | null;
    overview: string | null;
  };
}

export interface WatchlistResponse {
  success: boolean;
  data: WatchlistItemDto[];
}

export interface ToggleWatchlistResponse {
  success: boolean;
  data: {
    isAdded: boolean;
    watchlist_id?: string;
  };
}

export interface CheckWatchlistResponse {
  success: boolean;
  isAdded: boolean;
  watchlist_id?: string;
}
