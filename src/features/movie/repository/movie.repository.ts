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

