import {
  UpcomingMoviesResponse,
  JustReleaseMoviesResponse,
  PopularResponse,
  FeaturedResponse,
  BestMoviesResponse,
  BestTVSeriesResponse,
  BrowseMediaResponse,
  MovieDetailResponse,
  TVSeriesDetailResponse,
  TVSeasonEpisodesResponse,
  SimilarContentResponse,
  BrowseGridResponse,
  GenresResponse,
  BrowseFilterParams,
  CountriesResponse,
} from "../movie.type";
import {
  getUpcomingHeroMoviesService,
  getJustReleasedMoviesService,
  getWeeklyPopularContentService,
  getFeaturedContentService,
  getBestMoviesService,
  getBestTVSeriesService,
  getBrowseContentService,
  getMovieDetailService,
  getTVSeriesDetailService,
  getTVSeasonEpisodesService,
  getSimilarMoviesService,
  getSimilarTVShowsService,
  getGenresService,
  getBrowseGridService,
  getCountriesService,
  searchContentService,
} from "../service/movie.service";

export const getUpcomingMoviesController = async (): Promise<UpcomingMoviesResponse> => {
  const movies = await getUpcomingHeroMoviesService();
  return {
    movies,
  };
};

export const getJustReleasedMoviesController = async (
  limit: number = 20
): Promise<JustReleaseMoviesResponse> => {
  const movies = await getJustReleasedMoviesService(limit);
  return {
    movies,
  };
};

export const getPopularContentController = async (): Promise<PopularResponse> => {
  const items = await getWeeklyPopularContentService(12);
  return {
    items,
  };
};

export const getFeaturedContentController = async (): Promise<FeaturedResponse> => {
  const items = await getFeaturedContentService();
  return {
    items,
  };
};

export const getBestMoviesController = async (): Promise<BestMoviesResponse> => {
  const movies = await getBestMoviesService(12);
  return {
    movies,
  };
};

export const getBestTVSeriesController = async (): Promise<BestTVSeriesResponse> => {
  const series = await getBestTVSeriesService(12);
  return {
    series,
  };
};

export const getBrowseContentController = async (
  typeParam?: string | null,
  countryParam?: string | null
): Promise<BrowseMediaResponse> => {
  const type: import("@/domain/movie/movie.types").MediaType =
    typeParam === "TV Series" ? "TV Series" : "Movies";
  const country = countryParam || "all";
  const items = await getBrowseContentService(type, country, 12);
  return {
    items,
  };
};

export const getMovieDetailController = async (
  movieId: string
): Promise<MovieDetailResponse | null> => {
  const movie = await getMovieDetailService(movieId);
  if (!movie) return null;
  return {
    movie,
  };
};

export const getTVSeriesDetailController = async (
  tvId: string,
  seasonNumber?: string | null
): Promise<TVSeriesDetailResponse | null> => {
  const tv = await getTVSeriesDetailService(tvId, seasonNumber || undefined);
  if (!tv) return null;
  return {
    tv,
  };
};

export const getTVSeasonEpisodesController = async (
  tvId: string,
  seasonNumber: string
): Promise<TVSeasonEpisodesResponse> => {
  const episodes = await getTVSeasonEpisodesService(tvId, seasonNumber);
  return {
    episodes,
  };
};

export const getSimilarMoviesController = async (
  movieId: string
): Promise<SimilarContentResponse> => {
  const items = await getSimilarMoviesService(movieId, 12);
  return {
    items,
  };
};

export const getSimilarTVShowsController = async (
  tvId: string
): Promise<SimilarContentResponse> => {
  const items = await getSimilarTVShowsService(tvId, 12);
  return {
    items,
  };
};

export const getGenresController = async (
  typeParam?: string | null
): Promise<GenresResponse> => {
  const type: "all" | "movie" | "tv" =
    typeParam === "movie" || typeParam === "movies"
      ? "movie"
      : typeParam === "tv" || typeParam === "series"
        ? "tv"
        : "all";
  const genres = await getGenresService(type);
  return {
    genres,
  };
};

export const getBrowseGridController = async (
  params: BrowseFilterParams
): Promise<BrowseGridResponse> => {
  return await getBrowseGridService(params);
};

export const getCountriesController = async (): Promise<CountriesResponse> => {
  const countries = await getCountriesService();
  return {
    countries,
  };
};

export const searchContentController = async (params: {
  query?: string;
  page?: number;
  limit?: number;
}): Promise<BrowseGridResponse> => {
  return await searchContentService(params);
};



