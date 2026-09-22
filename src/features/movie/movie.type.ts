export type {
  UpcomingMovie,
  JustReleaseMovie,
  PopularContent,
  FeaturedContent,
  MovieItem,
  SeriesItem,
  MediaType,
  MediaItem,
  CastMember,
  ReviewItem,
  EpisodeItem,
  SeasonItem,
  MovieDetail,
  TVSeriesDetail,
  SimilarContentItem,
  BrowseItem,
  BrowseGridResponse,
  GenreOption,
  GenresResponse,
  BrowseFilterParams,
  CountryOption,
  CountriesResponse,
} from "@/domain/movie/movie.types";

export interface UpcomingMoviesResponse {
  movies: import("@/domain/movie/movie.types").UpcomingMovie[];
}

export interface JustReleaseMoviesResponse {
  movies: import("@/domain/movie/movie.types").JustReleaseMovie[];
}

export interface PopularResponse {
  items: import("@/domain/movie/movie.types").PopularContent[];
}

export interface FeaturedResponse {
  items: import("@/domain/movie/movie.types").FeaturedContent[];
}

export interface BestMoviesResponse {
  movies: import("@/domain/movie/movie.types").MovieItem[];
}

export interface BestTVSeriesResponse {
  series: import("@/domain/movie/movie.types").SeriesItem[];
}

export interface BrowseMediaResponse {
  items: import("@/domain/movie/movie.types").MediaItem[];
}

export interface MovieDetailResponse {
  movie: import("@/domain/movie/movie.types").MovieDetail;
}

export interface TVSeriesDetailResponse {
  tv: import("@/domain/movie/movie.types").TVSeriesDetail;
}

export interface TVSeasonEpisodesResponse {
  episodes: import("@/domain/movie/movie.types").EpisodeItem[];
}

export interface SimilarContentResponse {
  items: import("@/domain/movie/movie.types").SimilarContentItem[];
}

