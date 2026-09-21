import {
  getUpcomingMovies,
  getNowPlayingMovies,
  getOnTheAirTV,
  getWeeklyTrendingAll,
  getMovieGenreList,
  getTVGenreList,
  getMovieDetailsWithVideos,
  getMovieDetailsWithReleaseDates,
  getTVDetailsWithRatings,
  getDiscoverMovies,
  getDiscoverTV,
  getTopRatedMovies,
  getTopRatedTV,
  getMovieDetailsFull,
  getTVDetailsFull,
  getTVSeasonDetails,
  getMovieSimilar,
  getTVSimilar,
  getTMDBCountries,
  searchMoviesFromTMDB,
  searchTVFromTMDB,
} from "@/infrastructure/tmdb/tmdb.movie";
import {
  TMDBUpcomingResponse,
  TMDBNowPlayingResponse,
  TMDBTrendingResponse,
  TMDBGenreListResponse,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBDiscoverMovieResponse,
  TMDBDiscoverTVResponse,
  TMDBSeasonDetails,
  TMDBCountry,
} from "@/infrastructure/tmdb/tmdb.types";

export const findUpcomingMoviesFromTMDB = async (
  page: number = 1
): Promise<TMDBUpcomingResponse> => {
  return await getUpcomingMovies(page);
};

export const findNowPlayingMoviesFromTMDB = async (
  page: number = 1
): Promise<TMDBNowPlayingResponse> => {
  return await getNowPlayingMovies(page);
};

export const findOnTheAirTVFromTMDB = async (
  page: number = 1
): Promise<TMDBDiscoverTVResponse> => {
  return await getOnTheAirTV(page);
};

export const findWeeklyTrendingFromTMDB = async (
  page: number = 1
): Promise<TMDBTrendingResponse> => {
  return await getWeeklyTrendingAll(page);
};

export const findMovieGenresFromTMDB = async (): Promise<TMDBGenreListResponse> => {
  return await getMovieGenreList();
};

export const findTVGenresFromTMDB = async (): Promise<TMDBGenreListResponse> => {
  return await getTVGenreList();
};

export const findMovieDetailsWithVideosFromTMDB = async (
  movieId: number | string
): Promise<TMDBMovieDetails> => {
  return await getMovieDetailsWithVideos(movieId);
};

export const findMovieDetailsWithReleaseDatesFromTMDB = async (
  movieId: number | string
): Promise<TMDBMovieDetails> => {
  return await getMovieDetailsWithReleaseDates(movieId);
};

export const findTVDetailsWithRatingsFromTMDB = async (
  tvId: number | string
): Promise<TMDBTVDetails> => {
  return await getTVDetailsWithRatings(tvId);
};

export const findDiscoverMoviesFromTMDB = async (
  params: Record<string, string | number | boolean | undefined>
): Promise<TMDBDiscoverMovieResponse> => {
  return await getDiscoverMovies(params);
};

export const findDiscoverTVFromTMDB = async (
  params: Record<string, string | number | boolean | undefined>
): Promise<TMDBDiscoverTVResponse> => {
  return await getDiscoverTV(params);
};

export const findTopRatedMoviesFromTMDB = async (
  page: number = 1
): Promise<TMDBDiscoverMovieResponse> => {
  return await getTopRatedMovies(page);
};

export const findTopRatedTVFromTMDB = async (
  page: number = 1
): Promise<TMDBDiscoverTVResponse> => {
  return await getTopRatedTV(page);
};

export const findMovieDetailsFullFromTMDB = async (
  movieId: number | string
): Promise<TMDBMovieDetails> => {
  return await getMovieDetailsFull(movieId);
};

export const findTVDetailsFullFromTMDB = async (
  tvId: number | string
): Promise<TMDBTVDetails> => {
  return await getTVDetailsFull(tvId);
};

export const findTVSeasonDetailsFromTMDB = async (
  tvId: number | string,
  seasonNumber: number | string
): Promise<TMDBSeasonDetails> => {
  return await getTVSeasonDetails(tvId, seasonNumber);
};

export const findMovieSimilarFromTMDB = async (
  movieId: number | string,
  page: number = 1
): Promise<TMDBDiscoverMovieResponse> => {
  return await getMovieSimilar(movieId, page);
};

export const findTVSimilarFromTMDB = async (
  tvId: number | string,
  page: number = 1
): Promise<TMDBDiscoverTVResponse> => {
  return await getTVSimilar(tvId, page);
};

import { supabase } from "@/libs/supabase";

export interface MovieAwardRecord {
  movie_award_id: string;
  movie_id: string;
  award_name: string;
  category: string;
  year?: number | null;
  result?: string | null;
  movies?: {
    movie_id: string;
    tmdb_id: number;
    title: string;
  } | {
    movie_id: string;
    tmdb_id: number;
    title: string;
  }[] | null;
}

export interface TVShowAwardRecord {
  tv_award_id: string;
  tv_id: string;
  award_name: string;
  category: string;
  year?: number | null;
  result?: string | null;
  tv_shows?: {
    tv_id: string;
    tmdb_id: number;
    name: string;
  } | {
    tv_id: string;
    tmdb_id: number;
    name: string;
  }[] | null;
}

export const findWinningMovieAwardsFromDB = async (): Promise<MovieAwardRecord[]> => {
  try {
    const { data, error } = await supabase
      .from("movie_awards")
      .select(`
        movie_award_id,
        movie_id,
        award_name,
        category,
        year,
        result,
        movies (
          movie_id,
          tmdb_id,
          title
        )
      `)
      .ilike("result", "%win%");

    if (error) {
      console.error("Error querying winning movie awards from Supabase:", error);
      return [];
    }

    return (data as unknown as MovieAwardRecord[]) || [];
  } catch (err) {
    console.error("Supabase movie awards fetch failed:", err);
    return [];
  }
};

export const findWinningTVShowAwardsFromDB = async (): Promise<TVShowAwardRecord[]> => {
  try {
    const { data, error } = await supabase
      .from("tv_show_awards")
      .select(`
        tv_award_id,
        tv_id,
        award_name,
        category,
        year,
        result,
        tv_shows (
          tv_id,
          tmdb_id,
          name
        )
      `)
      .ilike("result", "%win%");

    if (error) {
      console.error("Error querying winning TV show awards from Supabase:", error);
      return [];
    }

    return (data as unknown as TVShowAwardRecord[]) || [];
  } catch (err) {
    console.error("Supabase TV show awards fetch failed:", err);
    return [];
  }
};

export const findCountriesFromTMDB = async (): Promise<TMDBCountry[]> => {
  return await getTMDBCountries();
};

export const findSearchMoviesFromTMDB = async (
  query: string,
  page: number = 1
): Promise<TMDBDiscoverMovieResponse> => {
  return await searchMoviesFromTMDB(query, page);
};

export const findSearchTVFromTMDB = async (
  query: string,
  page: number = 1
): Promise<TMDBDiscoverTVResponse> => {
  return await searchTVFromTMDB(query, page);
};

