export interface TMDBMovieSummary {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  adult?: boolean;
  video?: boolean;
}

export interface TMDBTrendingItem {
  id: number;
  title?: string;
  name?: string;
  media_type?: "movie" | "tv" | string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  adult?: boolean;
  release_date?: string;
  first_air_date?: string;
  origin_country?: string[];
}

export interface TMDBTrendingResponse {
  page: number;
  results: TMDBTrendingItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBUpcomingResponse {
  page: number;
  results: TMDBMovieSummary[];
  total_pages: number;
  total_results: number;
  dates?: {
    maximum: string;
    minimum: string;
  };
}

export interface TMDBNowPlayingResponse {
  page: number;
  results: TMDBMovieSummary[];
  total_pages: number;
  total_results: number;
  dates?: {
    maximum: string;
    minimum: string;
  };
}

export interface TMDBDiscoverMovieResponse {
  page: number;
  results: TMDBMovieSummary[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreListResponse {
  genres: TMDBGenre[];
}

export interface TMDBVideo {
  iso_639_1?: string;
  iso_3166_1?: string;
  name?: string;
  key: string;
  site: string;
  size?: number;
  type: string;
  official?: boolean;
  published_at?: string;
  id?: string;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

export interface TMDBReleaseDatesResponse {
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification: string;
      type?: number;
    }>;
  }>;
}

export interface TMDBContentRatingsResponse {
  results: Array<{
    iso_3166_1: string;
    rating: string;
  }>;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
}

export interface TMDBCreditsResponse {
  cast: TMDBCastMember[];
}

export interface TMDBReviewAuthorDetails {
  name?: string;
  username?: string;
  avatar_path?: string | null;
  rating?: number | null;
}

export interface TMDBReview {
  id: string;
  author: string;
  author_details?: TMDBReviewAuthorDetails;
  content: string;
  created_at?: string;
  url?: string;
}

export interface TMDBReviewsResponse {
  page: number;
  results: TMDBReview[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path?: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date?: string;
  runtime?: number | null;
  still_path?: string | null;
  vote_average?: number;
  vote_count?: number;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  overview: string;
  poster_path?: string | null;
  air_date?: string;
  episodes: TMDBEpisode[];
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  overview?: string | null;
  release_date?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  genres: TMDBGenre[];
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  runtime?: number | null;
  status?: string;
  tagline?: string | null;
  videos?: TMDBVideosResponse;
  release_dates?: TMDBReleaseDatesResponse;
  credits?: TMDBCreditsResponse;
  reviews?: TMDBReviewsResponse;
  similar?: TMDBDiscoverMovieResponse;
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  overview?: string | null;
  first_air_date?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  genres: TMDBGenre[];
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  episode_run_time?: number[];
  last_episode_to_air?: {
    runtime?: number | null;
  };
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TMDBSeasonSummary[];
  status?: string;
  tagline?: string | null;
  videos?: TMDBVideosResponse;
  content_ratings?: TMDBContentRatingsResponse;
  credits?: TMDBCreditsResponse;
  reviews?: TMDBReviewsResponse;
  similar?: TMDBDiscoverTVResponse;
}

export interface TMDBTVSummary {
  id: number;
  name: string;
  overview: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  origin_country?: string[];
}

export interface TMDBDiscoverTVResponse {
  page: number;
  results: TMDBTVSummary[];
  total_pages: number;
  total_results: number;
}

export interface TMDBCountry {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}


