import { fetchFromTMDB, TMDBNotFoundError } from "./tmdb.client";
import {
  TMDBUpcomingResponse,
  TMDBNowPlayingResponse,
  TMDBTrendingResponse,
  TMDBGenreListResponse,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBDiscoverMovieResponse,
  TMDBDiscoverTVResponse,
  TMDBCountry,
} from "./tmdb.types";

/**
 * Fetches upcoming movies from TMDB
 */
export async function getUpcomingMovies(page: number = 1): Promise<TMDBUpcomingResponse> {
  return fetchFromTMDB<TMDBUpcomingResponse>("/movie/upcoming", {
    page,
    language: "en-US",
  });
}

/**
 * Fetches movies currently in theatres / recently released from TMDB
 */
export async function getNowPlayingMovies(page: number = 1): Promise<TMDBNowPlayingResponse> {
  return fetchFromTMDB<TMDBNowPlayingResponse>("/movie/now_playing", {
    page,
    language: "en-US",
  });
}

/**
 * Fetches TV series currently airing / on the air from TMDB
 */
export async function getOnTheAirTV(page: number = 1): Promise<TMDBDiscoverTVResponse> {
  return fetchFromTMDB<TMDBDiscoverTVResponse>("/tv/on_the_air", {
    page,
    language: "en-US",
  });
}

/**
 * Fetches weekly trending items across all media types (Movies & TV Series)
 */
export async function getWeeklyTrendingAll(page: number = 1): Promise<TMDBTrendingResponse> {
  return fetchFromTMDB<TMDBTrendingResponse>("/trending/all/week", {
    page,
    language: "en-US",
  });
}

/**
 * Fetches the official TMDB movie genre list (e.g. { id: 28, name: "Action" })
 */
export async function getMovieGenreList(): Promise<TMDBGenreListResponse> {
  return fetchFromTMDB<TMDBGenreListResponse>("/genre/movie/list", {
    language: "en-US",
  });
}

/**
 * Fetches the official TMDB TV series genre list (e.g. { id: 10765, name: "Sci-Fi & Fantasy" })
 */
export async function getTVGenreList(): Promise<TMDBGenreListResponse> {
  return fetchFromTMDB<TMDBGenreListResponse>("/genre/tv/list", {
    language: "en-US",
  });
}

/**
 * Fetches detailed movie information including videos via append_to_response
 */
export async function getMovieDetailsWithVideos(
  movieId: number | string
): Promise<TMDBMovieDetails> {
  return fetchFromTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: "videos",
    language: "en-US",
  });
}

/**
 * Fetches detailed movie information including release_dates via append_to_response
 */
export async function getMovieDetailsWithReleaseDates(
  movieId: number | string
): Promise<TMDBMovieDetails> {
  return fetchFromTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: "release_dates",
    language: "en-US",
  });
}

/**
 * Fetches detailed TV series information including content_ratings via append_to_response
 */
export async function getTVDetailsWithRatings(
  tvId: number | string
): Promise<TMDBTVDetails> {
  return fetchFromTMDB<TMDBTVDetails>(`/tv/${tvId}`, {
    append_to_response: "content_ratings",
    language: "en-US",
  });
}

/**
 * Discover movies by genre and filters
 */
export async function getDiscoverMovies(
  params: Record<string, string | number | boolean | undefined>
): Promise<TMDBDiscoverMovieResponse> {
  return fetchFromTMDB<TMDBDiscoverMovieResponse>("/discover/movie", {
    language: "en-US",
    ...params,
  });
}

/**
 * Discover TV series by genre and filters
 */
export async function getDiscoverTV(
  params: Record<string, string | number | boolean | undefined>
): Promise<TMDBDiscoverTVResponse> {
  return fetchFromTMDB<TMDBDiscoverTVResponse>("/discover/tv", {
    language: "en-US",
    ...params,
  });
}

/**
 * Fetches top rated movies from TMDB
 */
export async function getTopRatedMovies(page: number = 1): Promise<TMDBDiscoverMovieResponse> {
  return fetchFromTMDB<TMDBDiscoverMovieResponse>("/movie/top_rated", {
    page,
    language: "en-US",
  });
}

/**
 * Fetches top rated TV series from TMDB
 */
export async function getTopRatedTV(page: number = 1): Promise<TMDBDiscoverTVResponse> {
  return fetchFromTMDB<TMDBDiscoverTVResponse>("/tv/top_rated", {
    page,
    language: "en-US",
  });
}

/**
 * Fetches full movie details including videos, release_dates, credits, and reviews
 */
export async function getMovieDetailsFull(
  movieId: number | string
): Promise<TMDBMovieDetails> {
  try {
    return await fetchFromTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
      append_to_response: "videos,release_dates,credits,reviews",
      language: "en-US",
    });
  } catch (err) {
    if (err instanceof TMDBNotFoundError) {
      throw err;
    }
    // Resilient fallback to basic movie details
    return await fetchFromTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
      language: "en-US",
    });
  }
}

/**
 * Fetches full TV series details including videos, content_ratings, credits, and reviews
 */
export async function getTVDetailsFull(
  tvId: number | string
): Promise<TMDBTVDetails> {
  try {
    return await fetchFromTMDB<TMDBTVDetails>(`/tv/${tvId}`, {
      append_to_response: "videos,content_ratings,credits,reviews",
      language: "en-US",
    });
  } catch (err) {
    if (err instanceof TMDBNotFoundError) {
      throw err;
    }
    // Resilient fallback to basic TV details
    return await fetchFromTMDB<TMDBTVDetails>(`/tv/${tvId}`, {
      language: "en-US",
    });
  }
}

/**
 * Fetches TV series season details including all episodes
 */
export async function getTVSeasonDetails(
  tvId: number | string,
  seasonNumber: number | string
): Promise<import("./tmdb.types").TMDBSeasonDetails> {
  return fetchFromTMDB<import("./tmdb.types").TMDBSeasonDetails>(
    `/tv/${tvId}/season/${seasonNumber}`,
    {
      language: "en-US",
    }
  );
}

/**
 * Fetches similar movies from TMDB
 */
export async function getMovieSimilar(
  movieId: number | string,
  page: number = 1
): Promise<TMDBDiscoverMovieResponse> {
  return fetchFromTMDB<TMDBDiscoverMovieResponse>(`/movie/${movieId}/similar`, {
    page,
    language: "en-US",
  });
}

/**
 * Fetches similar TV series from TMDB
 */
export async function getTVSimilar(
  tvId: number | string,
  page: number = 1
): Promise<TMDBDiscoverTVResponse> {
  return fetchFromTMDB<TMDBDiscoverTVResponse>(`/tv/${tvId}/similar`, {
    page,
    language: "en-US",
  });
}

/**
 * Fetches all official countries configured in TMDB
 */
export async function getTMDBCountries(): Promise<TMDBCountry[]> {
  return fetchFromTMDB<TMDBCountry[]>("/configuration/countries", {
    language: "en-US",
  });
}

/**
 * Searches movies by query string from TMDB
 */
export async function searchMoviesFromTMDB(
  query: string,
  page: number = 1
): Promise<TMDBDiscoverMovieResponse> {
  return fetchFromTMDB<TMDBDiscoverMovieResponse>("/search/movie", {
    query,
    page,
    include_adult: false,
    language: "en-US",
  });
}

/**
 * Searches TV series by query string from TMDB
 */
export async function searchTVFromTMDB(
  query: string,
  page: number = 1
): Promise<TMDBDiscoverTVResponse> {
  return fetchFromTMDB<TMDBDiscoverTVResponse>("/search/tv", {
    query,
    page,
    include_adult: false,
    language: "en-US",
  });
}

