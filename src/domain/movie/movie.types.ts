export interface UpcomingMovie {
  id: string;
  tag: string;
  title: string;
  year: string;
  release_date: string;
  media_type: "movie" | "tv";
  genres: string[];
  description: string;
  backdrop: string;
  poster?: string;
  poster_path?: string;
  vote_average?: number;
  trailerId: string;
}

export interface JustReleaseMovie {
  id: string;
  title: string;
  rating: string;
  genres: string[];
  type: string;
  poster: string;
}

export interface PopularContent {
  id: string;
  rank: number;
  title: string;
  poster: string;
  genres: string[];
  vote_count: number;
  rating: string;
  type: "Movie" | "TV Series";
}

export interface FeaturedContent {
  id: string;
  tag: string;
  title: string;
  rating: string;
  duration: string;
  year: string;
  genres: string[];
  certificate: string;
  description: string;
  poster: string;
  backdrop: string;
  type: "Movie" | "TV Series";
}

export interface MovieItem {
  id: string;
  title: string;
  rating: string;
  genres: string[];
  type: "Movie";
  backdrop: string;
}

export interface SeriesItem {
  id: string;
  title: string;
  rating: string;
  genres: string[];
  type: "TV Series";
  backdrop: string;
}

export type MediaType = "Movies" | "TV Series";

export interface MediaItem {
  id: string;
  title: string;
  rating: string;
  genres: string[];
  type: MediaType;
  country: string;
  backdrop: string;
}

export interface CastMember {
  id: string;
  name: string;
  character: string;
  avatar: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  username: string;
  avatar: string;
  rating: number; // 0 - 5
  content: string;
  createdAt: string;
}

export interface EpisodeItem {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  displayEpisodeNumber: number;
  title: string;
  overview: string;
  airDate: string;
  runtime: string;
  still: string;
}

export interface SeasonItem {
  id: string;
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes?: EpisodeItem[];
}

export interface MovieDetail {
  id: string;
  title: string;
  rating: string;
  year: string;
  duration: string;
  certificate: string;
  genres: string[];
  description: string;
  poster: string;
  backdrop: string;
  trailerId: string;
  tagline?: string;
  cast: CastMember[];
  reviews: ReviewItem[];
  type: "Movie";
  releaseDate?: string;
  status?: string;
  isUpcoming?: boolean;
}

export interface TVSeriesDetail {
  id: string;
  title: string;
  rating: string;
  year: string;
  duration: string;
  certificate: string;
  genres: string[];
  description: string;
  poster: string;
  backdrop: string;
  trailerId: string;
  tagline?: string;
  seasons: SeasonItem[];
  currentSeasonNumber: number;
  episodes: EpisodeItem[];
  cast: CastMember[];
  reviews: ReviewItem[];
  type: "TV Series";
  releaseDate?: string;
  status?: string;
  isUpcoming?: boolean;
}

export interface SimilarContentItem {
  id: string;
  title: string;
  rating: string;
  genres: string[];
  type: "Movie" | "TV Series";
  backdrop: string;
  poster?: string;
  year?: string;
}

export interface BrowseItem {
  id: string;
  title: string;
  rating: string;
  genres: string[];
  type: "Movie" | "TV Series";
  country?: string;
  poster: string;
  backdrop: string;
  season?: string;
  year?: string;
}

export interface BrowseGridResponse {
  items: BrowseItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  hasMore: boolean;
}

export interface GenreOption {
  id: number;
  name: string;
}

export interface GenresResponse {
  genres: GenreOption[];
}

export interface BrowseFilterParams {
  type?: "all" | "movies" | "tv";
  country?: string;
  genre?: string | number;
  sort?: "all" | "popular" | "most-rated" | "new-releases" | "worst-rated" | "title-asc" | "title-desc";
  page?: number;
  limit?: number;
}

export interface CountryOption {
  code: string;
  name: string;
}

export interface CountriesResponse {
  countries: CountryOption[];
}

export interface ReleaseItem {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  releaseDate: string; // "YYYY-MM-DD"
  day: string;         // "05", "25", etc.
  genres: string[];
  overview: string;
  voteAverage: number;
  status: "Released" | "Upcoming" | "Now Playing";
  mediaType: "movie" | "tv";
  seasonInfo?: string; // e.g. "S2 E10-20" or "S1 E1-10"
  releaseInfo?: string;
}

export interface ReleaseMonthGroup {
  month: number;
  name: string;
  releases: ReleaseItem[];
}

export interface ReleasesResponse {
  year: number;
  region: string;
  months: ReleaseMonthGroup[];
}
