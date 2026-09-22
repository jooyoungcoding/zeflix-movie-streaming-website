import {
  findUpcomingMoviesFromTMDB,
  findNowPlayingMoviesFromTMDB,
  findOnTheAirTVFromTMDB,
  findWeeklyTrendingFromTMDB,
  findMovieGenresFromTMDB,
  findTVGenresFromTMDB,
  findMovieDetailsWithVideosFromTMDB,
  findMovieDetailsWithReleaseDatesFromTMDB,
  findTVDetailsWithRatingsFromTMDB,
  findDiscoverMoviesFromTMDB,
  findDiscoverTVFromTMDB,
  findTopRatedMoviesFromTMDB,
  findTopRatedTVFromTMDB,
  findMovieDetailsFullFromTMDB,
  findTVDetailsFullFromTMDB,
  findTVSeasonDetailsFromTMDB,
  findMovieSimilarFromTMDB,
  findTVSimilarFromTMDB,
  findCountriesFromTMDB,
  findSearchMoviesFromTMDB,
  findSearchTVFromTMDB,
} from "../repository/movie.repository";
import {
  UpcomingMovie,
  JustReleaseMovie,
  PopularContent,
  FeaturedContent,
  MovieItem,
  SeriesItem,
  MediaType,
  MediaItem,
  MovieDetail,
  TVSeriesDetail,
  EpisodeItem,
  SeasonItem,
  CastMember,
  ReviewItem,
  SimilarContentItem,
  BrowseItem,
  BrowseGridResponse,
  GenreOption,
  CountryOption,
  ReleaseItem,
  ReleaseMonthGroup,
  ReleasesResponse,
} from "@/domain/movie/movie.types";
import {
  TMDBMovieDetails,
  TMDBMovieSummary,
  TMDBTVSummary,
  TMDBTrendingItem,
  TMDBTVDetails,
  TMDBVideo,
} from "@/infrastructure/tmdb/tmdb.types";



/**
 * Formats runtime in minutes into human-readable duration (e.g. "2h 15m" or "45m")
 */
export function formatDuration(runtimeMinutes?: number | null): string {
  if (!runtimeMinutes || runtimeMinutes <= 0) return "";
  const hours = Math.floor(runtimeMinutes / 60);
  const minutes = runtimeMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Extracts certification for a Movie (e.g. "PG-13", "R", "PG")
 */
export function extractMovieCertification(details: TMDBMovieDetails): string {
  const releaseDatesResults = details.release_dates?.results || [];
  const usResult = releaseDatesResults.find(
    (r) => r.iso_3166_1?.toUpperCase() === "US"
  );
  if (usResult && usResult.release_dates) {
    const certItem = usResult.release_dates.find((d) => Boolean(d.certification?.trim()));
    if (certItem && certItem.certification) {
      return certItem.certification.trim();
    }
  }
  for (const country of releaseDatesResults) {
    if (country.release_dates) {
      const certItem = country.release_dates.find((d) => Boolean(d.certification?.trim()));
      if (certItem && certItem.certification) {
        return certItem.certification.trim();
      }
    }
  }
  return "";
}

/**
 * Extracts content rating / certification for a TV Series (e.g. "TV-MA", "TV-14")
 */
export function extractTVCertification(details: TMDBTVDetails): string {
  const contentRatings = details.content_ratings?.results || [];
  const usResult = contentRatings.find(
    (r) => r.iso_3166_1?.toUpperCase() === "US"
  );
  if (usResult && usResult.rating?.trim()) {
    return usResult.rating.trim();
  }
  for (const country of contentRatings) {
    if (country.rating?.trim()) {
      return country.rating.trim();
    }
  }
  return "";
}

/**
 * Calculates the presentation tag based on the movie's release date
 * - Release within 7 days -> "Coming next week"
 * - Release within 30 days -> "Coming this month"
 * - Release more than 30 days away -> "Coming soon"
 * - If unavailable -> "Coming soon"
 */
export function calculateTag(releaseDateStr?: string | null): string {
  if (!releaseDateStr) return "Coming soon";

  const releaseDate = new Date(releaseDateStr);
  if (isNaN(releaseDate.getTime())) return "Coming soon";

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const targetDate = new Date(
    releaseDate.getFullYear(),
    releaseDate.getMonth(),
    releaseDate.getDate()
  );

  const diffMs = targetDate.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Now Playing";
  } else if (diffDays <= 7) {
    return "Coming next week";
  } else if (diffDays <= 30) {
    return "Coming this month";
  } else {
    return "Coming soon";
  }
}

/**
 * Extracts a YouTube trailer ID based on priority:
 * 1. site === "YouTube"
 * 2. type === "Trailer"
 * 3. official === true
 * If no official YouTube trailer exists, use another YouTube trailer.
 * If no YouTube trailer exists, check for teasers or fallback to "".
 */
export function extractYouTubeTrailerId(videos?: TMDBVideo[]): string {
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return "";
  }

  const youtubeVideos = videos.filter(
    (v) => v.site?.toLowerCase() === "youtube" && v.key
  );

  const trailers = youtubeVideos.filter(
    (v) => v.type?.toLowerCase() === "trailer"
  );

  const officialTrailer = trailers.find((v) => v.official === true);
  if (officialTrailer) {
    return officialTrailer.key;
  }

  if (trailers.length > 0) {
    return trailers[0].key;
  }

  const teaser = youtubeVideos.find((v) => v.type?.toLowerCase() === "teaser");
  if (teaser) {
    return teaser.key;
  }

  if (youtubeVideos.length > 0) {
    return youtubeVideos[0].key;
  }

  return "";
}

/**
 * Transforms a TMDB movie details record into an exact UpcomingMovie application object
 */
export function transformToUpcomingMovie(
  movie: TMDBMovieSummary | TMDBMovieDetails,
  genreMap: Record<number, string>,
  trailerId: string = ""
): UpcomingMovie {
  const tag = calculateTag(movie.release_date);
  const year = movie.release_date ? movie.release_date.substring(0, 4) : "";

  let genres: string[] = [];
  if ("genres" in movie && Array.isArray(movie.genres)) {
    genres = movie.genres.map((g) => g.name).filter(Boolean);
  } else if ("genre_ids" in movie && Array.isArray(movie.genre_ids)) {
    genres = movie.genre_ids.map((id) => genreMap[id]).filter(Boolean);
  }

  const description = movie.overview ?? "";
  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "";

  return {
    id: String(movie.id),
    tag,
    title: movie.title ?? "",
    year,
    release_date: movie.release_date ?? "",
    media_type: "movie",
    genres,
    description,
    backdrop,
    trailerId,
  };
}

/**
 * Transforms a TMDB TV summary into an UpcomingMovie slide for the Hero Slider
 */
export function transformTVToUpcomingSlide(
  tv: import("@/infrastructure/tmdb/tmdb.types").TMDBTVSummary,
  genreMap: Record<number, string>,
  trailerId: string = ""
): UpcomingMovie {
  const releaseDate = tv.first_air_date ?? "";
  const tag = calculateTag(releaseDate);
  const year = releaseDate ? releaseDate.substring(0, 4) : "";

  const genres = (tv.genre_ids || [])
    .map((id) => genreMap[id])
    .filter(Boolean);

  const backdrop = tv.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}`
    : "";

  return {
    id: String(tv.id),
    tag,
    title: tv.name ?? "",
    year,
    release_date: releaseDate,
    media_type: "tv",
    genres,
    description: tv.overview ?? "",
    backdrop,
    trailerId,
  };
}

/**
 * Transforms a TMDB movie summary into an exact JustReleaseMovie contract
 */
export function transformToJustReleaseMovie(
  movie: TMDBMovieSummary,
  genreMap: Record<number, string>
): JustReleaseMovie {
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : "0.0";

  const genres = (movie.genre_ids || [])
    .map((genreId) => genreMap[genreId])
    .filter(Boolean);

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "";

  return {
    id: String(movie.id),
    title: movie.title ?? "",
    rating,
    genres,
    type: "Movie",
    poster,
  };
}

/**
 * Transforms a TMDB TV summary into an exact JustReleaseMovie contract
 */
export function transformToJustReleaseTV(
  tv: TMDBTVSummary,
  genreMap: Record<number, string>
): JustReleaseMovie {
  const rating =
    typeof tv.vote_average === "number" && tv.vote_average > 0
      ? tv.vote_average.toFixed(1)
      : "0.0";

  const genres = (tv.genre_ids || [])
    .map((genreId: number) => genreMap[genreId])
    .filter(Boolean);

  const poster = tv.poster_path
    ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
    : "";

  return {
    id: String(tv.id),
    title: tv.name ?? "",
    rating,
    genres,
    type: "TV Series",
    poster,
  };
}

/**
 * Transforms a TMDB trending item into an exact PopularContent contract
 */
export function transformToPopularContent(
  item: TMDBTrendingItem,
  rank: number,
  genreMap: Record<number, string>
): PopularContent {
  const isMovie = item.media_type === "movie";
  const title = isMovie ? item.title ?? "" : item.name ?? "";
  const type: "Movie" | "TV Series" = isMovie ? "Movie" : "TV Series";

  const rating =
    typeof item.vote_average === "number" && item.vote_average > 0
      ? item.vote_average.toFixed(1)
      : "0.0";

  const vote_count =
    typeof item.vote_count === "number" ? item.vote_count : 0;

  const genres = (item.genre_ids || [])
    .map((genreId) => genreMap[genreId])
    .filter(Boolean);

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "";

  return {
    id: String(item.id),
    rank,
    title,
    poster,
    genres,
    vote_count,
    rating,
    type,
  };
}

/**
 * Service to fetch and prepare 10 upcoming/on-air items (5 movies + 5 TV series) for the Hero Section
 */
export const getUpcomingHeroMoviesService = async (): Promise<UpcomingMovie[]> => {
  // Fetch upcoming movies, on-air TV, movie genres, and TV genres in parallel
  const [upcomingData, onAirTVData, movieGenreData, tvGenreData] =
    await Promise.all([
      findUpcomingMoviesFromTMDB(1).catch(() => ({ results: [] })),
      findOnTheAirTVFromTMDB(1).catch(() => ({ results: [] })),
      findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
      findTVGenresFromTMDB().catch(() => ({ genres: [] })),
    ]);

  // Build genre lookup maps
  const movieGenreMap: Record<number, string> = {};
  (movieGenreData?.genres || []).forEach((g) => {
    movieGenreMap[g.id] = g.name;
  });

  const tvGenreMap: Record<number, string> = {};
  (tvGenreData?.genres || []).forEach((g) => {
    tvGenreMap[g.id] = g.name;
  });

  const rawMovies = (upcomingData as any)?.results || [];
  const rawTV = (onAirTVData as any)?.results || [];

  // Pick top 5 movies (prefer those with backdrop)
  const movieCandidates = rawMovies
    .filter((m: any) => !!m.backdrop_path)
    .slice(0, 5);
  const selectedMovies = (
    movieCandidates.length >= 5 ? movieCandidates : rawMovies.slice(0, 5)
  );

  // Pick top 5 TV (prefer those with backdrop)
  const tvCandidates = rawTV
    .filter((t: any) => !!t.backdrop_path)
    .slice(0, 5);
  const selectedTV = (
    tvCandidates.length >= 5 ? tvCandidates : rawTV.slice(0, 5)
  );

  // Fetch trailers for movies and TV in parallel
  const [movieSlides, tvSlides] = await Promise.all([
    Promise.all(
      selectedMovies.map(async (candidate: any) => {
        let trailerId = "";
        try {
          const details = await findMovieDetailsWithVideosFromTMDB(candidate.id);
          trailerId = extractYouTubeTrailerId(details.videos?.results);
        } catch {
          trailerId = "";
        }
        return transformToUpcomingMovie(candidate, movieGenreMap, trailerId);
      })
    ),
    Promise.all(
      selectedTV.map(async (tv: any) => {
        let trailerId = "";
        try {
          const details = await findTVDetailsFullFromTMDB(tv.id);
          trailerId = extractYouTubeTrailerId(details.videos?.results);
        } catch {
          trailerId = "";
        }
        return transformTVToUpcomingSlide(tv, tvGenreMap, trailerId);
      })
    ),
  ]);

  // Interleave: movie, tv, movie, tv... for variety
  const combined: UpcomingMovie[] = [];
  const maxLen = Math.max(movieSlides.length, tvSlides.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < movieSlides.length) combined.push(movieSlides[i]);
    if (i < tvSlides.length) combined.push(tvSlides[i]);
  }

  return combined.slice(0, 10);
};

/**
 * Service to fetch and prepare just released movies and TV series for the "Just Releases" Section
 */
export const getJustReleasedMoviesService = async (
  limit: number = 20
): Promise<JustReleaseMovie[]> => {
  // Fetch now playing movies, on the air TV series, and genre definitions in parallel
  const [nowPlayingData, onTheAirTVData, movieGenreData, tvGenreData] = await Promise.all([
    findNowPlayingMoviesFromTMDB(1).catch(() => ({ results: [] })),
    findOnTheAirTVFromTMDB(1).catch(() => ({ results: [] })),
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const rawMovies = nowPlayingData?.results || [];
  const rawTV = onTheAirTVData?.results || [];

  if (rawMovies.length === 0 && rawTV.length === 0) {
    return [];
  }

  // Build combined dictionary of genre ID -> genre name
  const genreMap: Record<number, string> = {};
  if (movieGenreData?.genres && Array.isArray(movieGenreData.genres)) {
    movieGenreData.genres.forEach((g) => {
      genreMap[g.id] = g.name;
    });
  }
  if (tvGenreData?.genres && Array.isArray(tvGenreData.genres)) {
    tvGenreData.genres.forEach((g) => {
      genreMap[g.id] = g.name;
    });
  }

  // Filter out items with missing poster or title
  const validMovies = rawMovies
    .filter((movie) => !!movie.title && !!movie.poster_path)
    .map((movie) => transformToJustReleaseMovie(movie, genreMap));

  const validTV = rawTV
    .filter((tv) => !!tv.name && !!tv.poster_path)
    .map((tv) => transformToJustReleaseTV(tv, genreMap));

  // Interleave movies and TV series evenly for a rich mixed carousel
  const combinedList: JustReleaseMovie[] = [];
  const maxLen = Math.max(validMovies.length, validTV.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < validMovies.length) combinedList.push(validMovies[i]);
    if (i < validTV.length) combinedList.push(validTV[i]);
  }

  // Select up to limit items
  return combinedList.slice(0, limit);
};

/**
 * Service to fetch and prepare weekly popular trending mixed content (Movies & TV Series)
 */
export const getWeeklyPopularContentService = async (
  limit: number = 12
): Promise<PopularContent[]> => {
  // Fetch weekly trending items, movie genres and TV genres in parallel
  const [trendingData, movieGenreData, tvGenreData] = await Promise.all([
    findWeeklyTrendingFromTMDB(1),
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const rawItems = trendingData?.results || [];
  if (rawItems.length === 0) {
    return [];
  }

  // Merge both Movie and TV genre lists into a single lookup dictionary
  const genreMap: Record<number, string> = {};
  if (movieGenreData?.genres && Array.isArray(movieGenreData.genres)) {
    movieGenreData.genres.forEach((g) => {
      genreMap[g.id] = g.name;
    });
  }
  if (tvGenreData?.genres && Array.isArray(tvGenreData.genres)) {
    tvGenreData.genres.forEach((g) => {
      genreMap[g.id] = g.name;
    });
  }

  // Filter valid items: movie or tv, has valid title/name, has valid poster
  const validItems = rawItems.filter(
    (item) =>
      (item.media_type === "movie" || item.media_type === "tv") &&
      Boolean(item.title || item.name) &&
      Boolean(item.poster_path)
  );

  // Slice to limit
  const selectedItems = validItems.slice(0, limit);

  // Assign sequential rank starting from 1
  return selectedItems.map((item, index) =>
    transformToPopularContent(item, index + 1, genreMap)
  );
};

interface FeaturedCategoryConfig {
  genreName: string;
  tag: string;
  movieGenreId: number;
  tvGenreId?: number;
  preferredType: "Movie" | "TV Series";
}

const FEATURED_CATEGORIES: FeaturedCategoryConfig[] = [
  {
    genreName: "Animation",
    tag: "#1 in Animation",
    movieGenreId: 16,
    tvGenreId: 16,
    preferredType: "Movie",
  },
  {
    genreName: "Action",
    tag: "#1 in Action",
    movieGenreId: 28,
    tvGenreId: 10759,
    preferredType: "Movie",
  },
  {
    genreName: "Drama",
    tag: "#1 in Drama",
    movieGenreId: 18,
    tvGenreId: 18,
    preferredType: "TV Series",
  },
  {
    genreName: "Sci-Fi",
    tag: "#1 in Sci-Fi",
    movieGenreId: 878,
    tvGenreId: 10765,
    preferredType: "TV Series",
  },
  {
    genreName: "Comedy",
    tag: "#1 in Comedy",
    movieGenreId: 35,
    tvGenreId: 35,
    preferredType: "Movie",
  },
  {
    genreName: "Horror",
    tag: "#1 in Horror",
    movieGenreId: 27,
    preferredType: "Movie",
  },
  {
    genreName: "Romance",
    tag: "#1 in Romance",
    movieGenreId: 10749,
    preferredType: "Movie",
  },
  {
    genreName: "Adventure",
    tag: "#1 in Adventure",
    movieGenreId: 12,
    tvGenreId: 10759,
    preferredType: "Movie",
  },
  {
    genreName: "Mystery",
    tag: "#1 in Mystery",
    movieGenreId: 9648,
    tvGenreId: 9648,
    preferredType: "TV Series",
  },
  {
    genreName: "Crime",
    tag: "#1 in Crime",
    movieGenreId: 80,
    tvGenreId: 80,
    preferredType: "TV Series",
  },
];

/**
 * Service to curate and prepare top featured category items (combining Movies & TV Series)
 */
export const getFeaturedContentService = async (): Promise<FeaturedContent[]> => {
  // Fetch genre maps in parallel
  const [movieGenreData, tvGenreData] = await Promise.all([
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const movieGenreMap: Record<number, string> = {};
  movieGenreData?.genres?.forEach((g) => {
    movieGenreMap[g.id] = g.name;
  });

  const tvGenreMap: Record<number, string> = {};
  tvGenreData?.genres?.forEach((g) => {
    tvGenreMap[g.id] = g.name;
  });

  const usedIds = new Set<string>();
  const featuredItems: FeaturedContent[] = [];

  for (const cat of FEATURED_CATEGORIES) {
    try {
      let chosenCandidate: {
        id: number;
        title?: string;
        name?: string;
        overview?: string | null;
        poster_path?: string | null;
        backdrop_path?: string | null;
        vote_average?: number;
        release_date?: string;
        first_air_date?: string;
        genre_ids?: number[];
      } | null = null;
      let chosenType: "Movie" | "TV Series" = cat.preferredType;

      if (cat.preferredType === "TV Series" && cat.tvGenreId) {
        const tvRes = await findDiscoverTVFromTMDB({
          with_genres: cat.tvGenreId,
          sort_by: "popularity.desc",
          "vote_count.gte": 10,
        }).catch(() => null);

        const candidate = tvRes?.results?.find(
          (t) =>
            Boolean(t.backdrop_path) &&
            Boolean(t.poster_path) &&
            Boolean(t.overview) &&
            !usedIds.has(`tv-${t.id}`)
        );

        if (candidate) {
          chosenCandidate = candidate;
          chosenType = "TV Series";
        }
      }

      if (!chosenCandidate && cat.movieGenreId) {
        const movieRes = await findDiscoverMoviesFromTMDB({
          with_genres: cat.movieGenreId,
          sort_by: "popularity.desc",
          "vote_count.gte": 10,
        }).catch(() => null);

        const candidate = movieRes?.results?.find(
          (m) =>
            Boolean(m.backdrop_path) &&
            Boolean(m.poster_path) &&
            Boolean(m.overview) &&
            !usedIds.has(`movie-${m.id}`)
        );

        if (candidate) {
          chosenCandidate = candidate;
          chosenType = "Movie";
        }
      }

      if (!chosenCandidate) {
        continue;
      }

      const key = `${chosenType === "Movie" ? "movie" : "tv"}-${chosenCandidate.id}`;
      usedIds.add(key);

      if (chosenType === "Movie") {
        let details: TMDBMovieDetails | null = null;
        try {
          details = await findMovieDetailsWithReleaseDatesFromTMDB(chosenCandidate.id);
        } catch {
          details = null;
        }

        const title = details?.title || chosenCandidate.title || "";
        const rating =
          typeof (details?.vote_average ?? chosenCandidate.vote_average) === "number" &&
            (details?.vote_average ?? chosenCandidate.vote_average)! > 0
            ? (details?.vote_average ?? chosenCandidate.vote_average)!.toFixed(1)
            : "0.0";
        const duration = formatDuration(details?.runtime);
        const year = (details?.release_date || chosenCandidate.release_date || "").slice(0, 4);
        const certificate = details ? extractMovieCertification(details) : "";
        const genres = details?.genres?.map((g) => g.name).filter(Boolean).length
          ? details.genres.map((g) => g.name).filter(Boolean)
          : (chosenCandidate.genre_ids || []).map((id) => movieGenreMap[id]).filter(Boolean);
        const description = details?.overview || chosenCandidate.overview || "";
        const poster = `https://image.tmdb.org/t/p/w500${details?.poster_path || chosenCandidate.poster_path}`;
        const backdrop = `https://image.tmdb.org/t/p/original${details?.backdrop_path || chosenCandidate.backdrop_path}`;

        featuredItems.push({
          id: String(chosenCandidate.id),
          tag: cat.tag,
          title,
          rating,
          duration,
          year,
          genres,
          certificate,
          description,
          poster,
          backdrop,
          type: "Movie",
        });
      } else {
        let details: TMDBTVDetails | null = null;
        try {
          details = await findTVDetailsWithRatingsFromTMDB(chosenCandidate.id);
        } catch {
          details = null;
        }

        const title = details?.name || chosenCandidate.name || "";
        const rating =
          typeof (details?.vote_average ?? chosenCandidate.vote_average) === "number" &&
            (details?.vote_average ?? chosenCandidate.vote_average)! > 0
            ? (details?.vote_average ?? chosenCandidate.vote_average)!.toFixed(1)
            : "0.0";
        const episodeRuntime = details?.episode_run_time?.[0] || details?.last_episode_to_air?.runtime;
        const duration = formatDuration(episodeRuntime);
        const year = (details?.first_air_date || chosenCandidate.first_air_date || "").slice(0, 4);
        const certificate = details ? extractTVCertification(details) : "";
        const genres = details?.genres?.map((g) => g.name).filter(Boolean).length
          ? details.genres.map((g) => g.name).filter(Boolean)
          : (chosenCandidate.genre_ids || []).map((id) => tvGenreMap[id]).filter(Boolean);
        const description = details?.overview || chosenCandidate.overview || "";
        const poster = `https://image.tmdb.org/t/p/w500${details?.poster_path || chosenCandidate.poster_path}`;
        const backdrop = `https://image.tmdb.org/t/p/original${details?.backdrop_path || chosenCandidate.backdrop_path}`;

        featuredItems.push({
          id: String(chosenCandidate.id),
          tag: cat.tag,
          title,
          rating,
          duration,
          year,
          genres,
          certificate,
          description,
          poster,
          backdrop,
          type: "TV Series",
        });
      }
    } catch {
      // Continue to next category on individual category failure
      continue;
    }
  }

  return featuredItems;
};

/**
 * Transforms a TMDB movie summary into an exact MovieItem application contract
 */
export function transformToMovieItem(
  movie: TMDBMovieSummary,
  genreMap: Record<number, string>
): MovieItem {
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : "0.0";

  const genres = (movie.genre_ids || [])
    .map((genreId) => genreMap[genreId])
    .filter(Boolean);

  const backdrop = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "";

  return {
    id: String(movie.id),
    title: movie.title ?? "",
    rating,
    genres,
    type: "Movie",
    backdrop,
  };
}

/**
 * Service to fetch and prepare 12 best movies (rating 8.0 - 10.0, sorted by rating descending)
 */
export const getBestMoviesService = async (
  limit: number = 12
): Promise<MovieItem[]> => {
  // Fetch top rated movies and genres in parallel
  const [topRatedData1, topRatedData2, genreData] = await Promise.all([
    findTopRatedMoviesFromTMDB(1),
    findTopRatedMoviesFromTMDB(2).catch(() => ({ results: [] })),
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const rawMovies = [
    ...(topRatedData1?.results || []),
    ...(topRatedData2?.results || []),
  ];

  if (rawMovies.length === 0) {
    return [];
  }

  // Build dictionary of genre ID -> genre name
  const genreMap: Record<number, string> = {};
  if (genreData?.genres && Array.isArray(genreData.genres)) {
    genreData.genres.forEach((g) => {
      genreMap[g.id] = g.name;
    });
  }

  // Filter: vote_average between 8.0 and 10.0, valid backdrop and title, avoid duplicates
  const seenIds = new Set<number>();
  const validMovies = rawMovies.filter((movie) => {
    if (!movie.id || seenIds.has(movie.id)) return false;
    if (!movie.title || !movie.backdrop_path) return false;
    const voteAvg = typeof movie.vote_average === "number" ? movie.vote_average : 0;
    if (voteAvg < 8.0 || voteAvg > 10.0) return false;
    seenIds.add(movie.id);
    return true;
  });

  // Sort strictly by vote_average descending
  validMovies.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));

  // Take top limit (12) items
  const selectedMovies = validMovies.slice(0, limit);

  return selectedMovies.map((movie) => transformToMovieItem(movie, genreMap));
};

/**
 * Transforms a TMDB TV summary into an exact SeriesItem application contract
 */
export function transformToSeriesItem(
  series: {
    id: number;
    name?: string;
    vote_average?: number;
    genre_ids?: number[];
    backdrop_path?: string | null;
  },
  genreMap: Record<number, string>
): SeriesItem {
  const rating =
    typeof series.vote_average === "number" && series.vote_average > 0
      ? series.vote_average.toFixed(1)
      : "0.0";

  const genres = (series.genre_ids || [])
    .map((genreId) => genreMap[genreId])
    .filter(Boolean);

  const backdrop = series.backdrop_path
    ? `https://image.tmdb.org/t/p/original${series.backdrop_path}`
    : "";

  return {
    id: String(series.id),
    title: series.name ?? "",
    rating,
    genres,
    type: "TV Series",
    backdrop,
  };
}

/**
 * Service to fetch and prepare 12 best TV Series (rating 8.0 - 10.0, sorted by rating descending)
 */
export const getBestTVSeriesService = async (
  limit: number = 12
): Promise<SeriesItem[]> => {
  // Fetch top rated TV series (2 pages) and TV genres in parallel
  const [topRatedData1, topRatedData2, genreData] = await Promise.all([
    findTopRatedTVFromTMDB(1),
    findTopRatedTVFromTMDB(2).catch(() => ({ results: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const rawSeries = [
    ...(topRatedData1?.results || []),
    ...(topRatedData2?.results || []),
  ];

  if (rawSeries.length === 0) {
    return [];
  }

  // Build dictionary of genre ID -> genre name
  const genreMap: Record<number, string> = {};
  if (genreData?.genres && Array.isArray(genreData.genres)) {
    genreData.genres.forEach((g) => {
      genreMap[g.id] = g.name;
    });
  }

  // Filter: vote_average between 8.0 and 10.0, valid backdrop and name, avoid duplicates
  const seenIds = new Set<number>();
  const validSeries = rawSeries.filter((series) => {
    if (!series.id || seenIds.has(series.id)) return false;
    if (!series.name || !series.backdrop_path) return false;
    const voteAvg = typeof series.vote_average === "number" ? series.vote_average : 0;
    if (voteAvg < 8.0 || voteAvg > 10.0) return false;
    seenIds.add(series.id);
    return true;
  });

  // Sort strictly by vote_average descending
  validSeries.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));

  // Take top limit (12) items
  const selectedSeries = validSeries.slice(0, limit);

  return selectedSeries.map((series) => transformToSeriesItem(series, genreMap));
};

export const COUNTRY_CODE_MAP: Record<string, string> = {
  us: "US",
  uk: "GB",
  korea: "KR",
  japan: "JP",
  france: "FR",
  china: "CN",
};

/**
 * Service to fetch and prepare media content by type ("Movies" | "TV Series") and country
 */
export const getBrowseContentService = async (
  type: MediaType = "Movies",
  country: string = "all",
  limit: number = 12
): Promise<MediaItem[]> => {
  const normalizedCountry = country.toLowerCase();
  const originCountryCode = COUNTRY_CODE_MAP[normalizedCountry];

  if (type === "TV Series") {
    const params: Record<string, string | number | boolean | undefined> = {
      sort_by: "popularity.desc",
      page: 1,
    };
    if (originCountryCode) {
      params.with_origin_country = originCountryCode;
    }

    const [discoverData, genreData] = await Promise.all([
      findDiscoverTVFromTMDB(params),
      findTVGenresFromTMDB().catch(() => ({ genres: [] })),
    ]);

    const genreMap: Record<number, string> = {};
    if (genreData?.genres && Array.isArray(genreData.genres)) {
      genreData.genres.forEach((g) => {
        genreMap[g.id] = g.name;
      });
    }

    const rawSeries = discoverData?.results || [];
    const validSeries = rawSeries.filter(
      (s) => Boolean(s.name) && Boolean(s.backdrop_path)
    );

    const selectedSeries = validSeries.slice(0, limit);

    return selectedSeries.map((s) => ({
      id: String(s.id),
      title: s.name ?? "",
      rating:
        typeof s.vote_average === "number" && s.vote_average > 0
          ? s.vote_average.toFixed(1)
          : "0.0",
      genres: (s.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
      type: "TV Series",
      country: normalizedCountry,
      backdrop: `https://image.tmdb.org/t/p/original${s.backdrop_path}`,
    }));
  } else {
    const params: Record<string, string | number | boolean | undefined> = {
      sort_by: "popularity.desc",
      page: 1,
    };
    if (originCountryCode) {
      params.with_origin_country = originCountryCode;
    }

    const [discoverData, genreData] = await Promise.all([
      findDiscoverMoviesFromTMDB(params),
      findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    ]);

    const genreMap: Record<number, string> = {};
    if (genreData?.genres && Array.isArray(genreData.genres)) {
      genreData.genres.forEach((g) => {
        genreMap[g.id] = g.name;
      });
    }

    const rawMovies = discoverData?.results || [];
    const validMovies = rawMovies.filter(
      (m) => Boolean(m.title) && Boolean(m.backdrop_path)
    );

    const selectedMovies = validMovies.slice(0, limit);

    return selectedMovies.map((m) => ({
      id: String(m.id),
      title: m.title ?? "",
      rating:
        typeof m.vote_average === "number" && m.vote_average > 0
          ? m.vote_average.toFixed(1)
          : "0.0",
      genres: (m.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
      type: "Movies",
      country: normalizedCountry,
      backdrop: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
    }));
  }
};

/**
 * Maps TMDB credits to application CastMember model
 */
export function mapCreditsToCast(credits?: {
  cast?: Array<{
    id: number;
    name: string;
    character?: string;
    profile_path?: string | null;
  }>;
}): CastMember[] {
  if (!credits?.cast || !Array.isArray(credits.cast)) return [];
  return credits.cast
    .filter((c) => Boolean(c.name))
    .slice(0, 10)
    .map((c) => ({
      id: String(c.id),
      name: c.name,
      character: c.character || "Actor",
      avatar: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : "",
    }));
}

/**
 * Maps TMDB reviews to application ReviewItem model
 */
export function mapTMDBReviews(reviews?: {
  results?: Array<{
    id: string;
    author: string;
    author_details?: {
      name?: string;
      username?: string;
      avatar_path?: string | null;
      rating?: number | null;
    };
    content: string;
    created_at?: string;
  }>;
}): ReviewItem[] {
  if (!reviews?.results || !Array.isArray(reviews.results)) return [];
  return reviews.results.slice(0, 12).map((r) => {
    let avatar = "";
    if (r.author_details?.avatar_path) {
      if (r.author_details.avatar_path.startsWith("http")) {
        avatar = r.author_details.avatar_path.replace(/^\//, "");
      } else {
        avatar = `https://image.tmdb.org/t/p/w185${r.author_details.avatar_path}`;
      }
    }

    const rawRating =
      typeof r.author_details?.rating === "number"
        ? r.author_details.rating
        : 8.5;
    const rating = Number((rawRating / 2).toFixed(1));

    return {
      id: r.id,
      author: r.author || r.author_details?.name || "Viewer",
      username: r.author_details?.username || r.author || "reviewer",
      avatar,
      rating,
      content: r.content || "",
      createdAt: r.created_at ? r.created_at.slice(0, 10) : "",
    };
  });
}

/**
 * Calculates continuous season starting offsets (excluding season 0 specials)
 */
export function calculateSeasonOffsets(
  seasons?: Array<{ season_number: number; episode_count: number }>
): Map<number, number> {
  const offsets = new Map<number, number>();
  if (!seasons || !Array.isArray(seasons)) return offsets;

  const validSeasons = seasons
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  let cumulative = 0;
  for (const s of validSeasons) {
    offsets.set(s.season_number, cumulative);
    cumulative += s.episode_count || 0;
  }

  return offsets;
}

/**
 * Service to fetch and prepare full Movie Detail
 */
export const getMovieDetailService = async (
  movieId: number | string
): Promise<MovieDetail | null> => {
  try {
    const details = await findMovieDetailsFullFromTMDB(movieId);
    if (!details || !details.id) return null;

    const rating =
      typeof details.vote_average === "number" && details.vote_average > 0
        ? details.vote_average.toFixed(1)
        : "0.0";
    const year = details.release_date ? details.release_date.slice(0, 4) : "";
    const duration = formatDuration(details.runtime);
    const certificate = extractMovieCertification(details);
    const genres = (details.genres || []).map((g) => g.name).filter(Boolean);
    const description = details.overview || "";
    const poster = details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : "";
    const backdrop = details.backdrop_path
      ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
      : "";
    const trailerId = extractYouTubeTrailerId(details.videos?.results);
    const tagline = details.tagline || "";
    const cast = mapCreditsToCast(details.credits);
    const reviews = mapTMDBReviews(details.reviews);

    const releaseDate = details.release_date || "";
    const status = details.status || "";
    const todayStr = new Date().toISOString().split("T")[0];
    const isUpcoming =
      (Boolean(releaseDate) && releaseDate > todayStr) ||
      (Boolean(status) && status.toLowerCase() !== "released");

    return {
      id: String(details.id),
      title: details.title || "",
      rating,
      year,
      duration,
      certificate,
      genres,
      description,
      poster,
      backdrop,
      trailerId,
      tagline,
      cast,
      reviews,
      type: "Movie",
      releaseDate,
      status,
      isUpcoming,
    };
  } catch (err: unknown) {
    const isNotFound =
      err instanceof Error &&
      (err.name === "TMDBNotFoundError" ||
        err.message.includes("404") ||
        err.message.includes("could not be found"));
    if (!isNotFound) {
      console.error("Error fetching movie detail:", err);
    }
    return null;
  }
};

/**
 * Service to fetch and prepare full TV Series Detail
 */
export const getTVSeriesDetailService = async (
  tvId: number | string,
  seasonNumberParam?: number | string
): Promise<TVSeriesDetail | null> => {
  try {
    const details = await findTVDetailsFullFromTMDB(tvId);
    if (!details || !details.id) return null;

    const rating =
      typeof details.vote_average === "number" && details.vote_average > 0
        ? details.vote_average.toFixed(1)
        : "0.0";
    const year = details.first_air_date ? details.first_air_date.slice(0, 4) : "";
    const epRuntime =
      details.episode_run_time?.[0] || details.last_episode_to_air?.runtime;
    const duration = formatDuration(epRuntime);
    const certificate = extractTVCertification(details);
    const genres = (details.genres || []).map((g) => g.name).filter(Boolean);
    const description = details.overview || "";
    const poster = details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : "";
    const backdrop = details.backdrop_path
      ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
      : "";
    const trailerId = extractYouTubeTrailerId(details.videos?.results);
    const tagline = details.tagline || "";
    const cast = mapCreditsToCast(details.credits);
    const reviews = mapTMDBReviews(details.reviews);

    // Filter valid seasons (excluding Season 0 specials from dropdown list)
    const rawSeasons = details.seasons || [];
    const validSeasons = rawSeasons
      .filter((s) => s.season_number > 0)
      .sort((a, b) => a.season_number - b.season_number);

    const availableSeasons: SeasonItem[] = (
      validSeasons.length > 0 ? validSeasons : rawSeasons
    ).map((s) => ({
      id: String(s.id),
      seasonNumber: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      episodeCount: s.episode_count || 0,
    }));

    // Active season selection
    const defaultSeasonNumber = availableSeasons[0]?.seasonNumber || 1;
    const activeSeasonNumber = seasonNumberParam
      ? Number(seasonNumberParam)
      : defaultSeasonNumber;

    // Calculate season offsets for continuous episode numbering
    const seasonOffsets = calculateSeasonOffsets(validSeasons);
    const seasonOffset = seasonOffsets.get(activeSeasonNumber) || 0;

    // Fetch episodes for active season
    let episodes: EpisodeItem[] = [];
    try {
      const seasonData = await findTVSeasonDetailsFromTMDB(
        tvId,
        activeSeasonNumber
      );
      if (seasonData?.episodes && Array.isArray(seasonData.episodes)) {
        episodes = seasonData.episodes.map((ep, idx) => {
          const displayEpisodeNumber =
            seasonOffset + (ep.episode_number || idx + 1);
          return {
            id: String(ep.id),
            seasonNumber: ep.season_number,
            episodeNumber: ep.episode_number,
            displayEpisodeNumber,
            title: ep.name || `Episode ${ep.episode_number}`,
            overview: ep.overview || "",
            airDate: ep.air_date || "",
            runtime: formatDuration(ep.runtime || epRuntime),
            still: ep.still_path
              ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
              : backdrop,
          };
        });
      }
    } catch {
      episodes = [];
    }

    const releaseDate = details.first_air_date || "";
    const status = details.status || "";
    const todayStr = new Date().toISOString().split("T")[0];
    const isUpcoming =
      (Boolean(releaseDate) && releaseDate > todayStr) ||
      (Boolean(status) &&
        !["returning series", "ended", "canceled", "released"].includes(
          status.toLowerCase()
        ));

    return {
      id: String(details.id),
      title: details.name || "",
      rating,
      year,
      duration,
      certificate,
      genres,
      description,
      poster,
      backdrop,
      trailerId,
      tagline,
      seasons: availableSeasons,
      currentSeasonNumber: activeSeasonNumber,
      episodes,
      cast,
      reviews,
      type: "TV Series",
      releaseDate,
      status,
      isUpcoming,
    };
  } catch (err: unknown) {
    const isNotFound =
      err instanceof Error &&
      (err.name === "TMDBNotFoundError" ||
        err.message.includes("404") ||
        err.message.includes("could not be found"));
    if (!isNotFound) {
      console.error("Error fetching TV series detail:", err);
    }
    return null;
  }
};

/**
 * Service to fetch and prepare episodes for a specific TV season
 */
export const getTVSeasonEpisodesService = async (
  tvId: number | string,
  targetSeasonNumber: number | string
): Promise<EpisodeItem[]> => {
  try {
    const details = await findTVDetailsFullFromTMDB(tvId);
    if (!details) return [];

    const rawSeasons = details.seasons || [];
    const validSeasons = rawSeasons.filter((s) => s.season_number > 0);
    const seasonOffsets = calculateSeasonOffsets(validSeasons);
    const seasonNum = Number(targetSeasonNumber);
    const seasonOffset = seasonOffsets.get(seasonNum) || 0;
    const epRuntime =
      details.episode_run_time?.[0] || details.last_episode_to_air?.runtime;

    const seasonData = await findTVSeasonDetailsFromTMDB(tvId, seasonNum);
    if (!seasonData?.episodes || !Array.isArray(seasonData.episodes)) {
      return [];
    }

    const backdrop = details.backdrop_path
      ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
      : "";

    return seasonData.episodes.map((ep, idx) => {
      const displayEpisodeNumber =
        seasonOffset + (ep.episode_number || idx + 1);
      return {
        id: String(ep.id),
        seasonNumber: ep.season_number,
        episodeNumber: ep.episode_number,
        displayEpisodeNumber,
        title: ep.name || `Episode ${ep.episode_number}`,
        overview: ep.overview || "",
        airDate: ep.air_date || "",
        runtime: formatDuration(ep.runtime || epRuntime),
        still: ep.still_path
          ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
          : backdrop,
      };
    });
  } catch (err) {
    console.error("Error fetching season episodes:", err);
    return [];
  }
};

/**
 * Service to fetch Similar Movies based on genre matching (maximum 12 items, excluding current movie)
 */
export const getSimilarMoviesService = async (
  movieId: number | string,
  limit: number = 12
): Promise<SimilarContentItem[]> => {
  try {
    const numMovieId = Number(movieId);

    // Fetch movie details to get target genre IDs and genre dictionary in parallel
    const [details, genreData] = await Promise.all([
      findMovieDetailsFullFromTMDB(movieId).catch(() => null),
      findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    ]);

    const genreMap: Record<number, string> = {};
    if (genreData?.genres && Array.isArray(genreData.genres)) {
      genreData.genres.forEach((g) => {
        genreMap[g.id] = g.name;
      });
    }

    const targetGenreIds = (details?.genres || []).map((g) => g.id);
    const targetGenreSet = new Set<number>(targetGenreIds);

    // Fetch candidates from TMDB similar endpoint and discover endpoint
    const [similarRes, discoverRes] = await Promise.all([
      findMovieSimilarFromTMDB(movieId, 1).catch(() => ({ results: [] })),
      targetGenreIds.length > 0
        ? findDiscoverMoviesFromTMDB({
          with_genres: targetGenreIds.slice(0, 3).join(","),
          sort_by: "popularity.desc",
          page: 1,
        }).catch(() => ({ results: [] }))
        : Promise.resolve({ results: [] }),
    ]);

    const rawCandidates = [
      ...(similarRes?.results || []),
      ...(discoverRes?.results || []),
    ];

    // Deduplicate and filter out current movie
    const seenIds = new Set<number>();
    const candidates = rawCandidates.filter((m) => {
      if (!m.id || m.id === numMovieId || seenIds.has(m.id)) return false;
      if (!m.title || (!m.backdrop_path && !m.poster_path)) return false;
      seenIds.add(m.id);
      return true;
    });

    // Score candidates by number of matching genre IDs + vote average
    const scoredCandidates = candidates.map((m) => {
      let matchedCount = 0;
      (m.genre_ids || []).forEach((gid) => {
        if (targetGenreSet.has(gid)) matchedCount++;
      });
      const score = matchedCount * 10 + (m.vote_average || 0);
      return { item: m, score };
    });

    // Sort by matching score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Slice to limit (max 12)
    const selected = scoredCandidates.slice(0, limit);

    return selected.map(({ item }) => {
      const rating =
        typeof item.vote_average === "number" && item.vote_average > 0
          ? item.vote_average.toFixed(1)
          : "0.0";
      const genres = (item.genre_ids || [])
        .map((gid) => genreMap[gid])
        .filter(Boolean);
      const backdrop = item.backdrop_path
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
        : item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "";
      const poster = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "";

      const year = item.release_date
        ? item.release_date.split("-")[0]
        : undefined;

      return {
        id: String(item.id),
        title: item.title || "",
        rating,
        genres,
        type: "Movie",
        backdrop,
        poster,
        year,
      };
    });
  } catch (err) {
    console.error("Error fetching similar movies:", err);
    return [];
  }
};

/**
 * Service to fetch Similar TV Series based on genre matching (maximum 12 items, excluding current TV series)
 */
export const getSimilarTVShowsService = async (
  tvId: number | string,
  limit: number = 12
): Promise<SimilarContentItem[]> => {
  try {
    const numTvId = Number(tvId);

    // Fetch TV details to get target genre IDs and genre dictionary in parallel
    const [details, genreData] = await Promise.all([
      findTVDetailsFullFromTMDB(tvId).catch(() => null),
      findTVGenresFromTMDB().catch(() => ({ genres: [] })),
    ]);

    const genreMap: Record<number, string> = {};
    if (genreData?.genres && Array.isArray(genreData.genres)) {
      genreData.genres.forEach((g) => {
        genreMap[g.id] = g.name;
      });
    }

    const targetGenreIds = (details?.genres || []).map((g) => g.id);
    const targetGenreSet = new Set<number>(targetGenreIds);

    // Fetch candidates from TMDB similar endpoint and discover endpoint
    const [similarRes, discoverRes] = await Promise.all([
      findTVSimilarFromTMDB(tvId, 1).catch(() => ({ results: [] })),
      targetGenreIds.length > 0
        ? findDiscoverTVFromTMDB({
          with_genres: targetGenreIds.slice(0, 3).join(","),
          sort_by: "popularity.desc",
          page: 1,
        }).catch(() => ({ results: [] }))
        : Promise.resolve({ results: [] }),
    ]);

    const rawCandidates = [
      ...(similarRes?.results || []),
      ...(discoverRes?.results || []),
    ];

    // Deduplicate and filter out current TV series
    const seenIds = new Set<number>();
    const candidates = rawCandidates.filter((t) => {
      if (!t.id || t.id === numTvId || seenIds.has(t.id)) return false;
      if (!t.name || (!t.backdrop_path && !t.poster_path)) return false;
      seenIds.add(t.id);
      return true;
    });

    // Score candidates by number of matching genre IDs + vote average
    const scoredCandidates = candidates.map((t) => {
      let matchedCount = 0;
      (t.genre_ids || []).forEach((gid) => {
        if (targetGenreSet.has(gid)) matchedCount++;
      });
      const score = matchedCount * 10 + (t.vote_average || 0);
      return { item: t, score };
    });

    // Sort by matching score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Slice to limit (max 12)
    const selected = scoredCandidates.slice(0, limit);

    return selected.map(({ item }) => {
      const rating =
        typeof item.vote_average === "number" && item.vote_average > 0
          ? item.vote_average.toFixed(1)
          : "0.0";
      const genres = (item.genre_ids || [])
        .map((gid) => genreMap[gid])
        .filter(Boolean);
      const backdrop = item.backdrop_path
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
        : item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "";
      const poster = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "";
      const year = item.first_air_date
        ? item.first_air_date.split("-")[0]
        : undefined;

      return {
        id: String(item.id),
        title: item.name || "",
        rating,
        genres,
        type: "TV Series",
        backdrop,
        poster,
        year,
      };
    });
  } catch (err) {
    console.error("Error fetching similar TV series:", err);
    return [];
  }
};

/**
 * Service to fetch official genres for movies, TV, or both
 */
export const getGenresService = async (
  type: "all" | "movie" | "tv" = "all"
): Promise<GenreOption[]> => {
  if (type === "movie") {
    const res = await findMovieGenresFromTMDB().catch(() => ({ genres: [] }));
    return (res.genres || []).map((g) => ({ id: g.id, name: g.name }));
  }
  if (type === "tv") {
    const res = await findTVGenresFromTMDB().catch(() => ({ genres: [] }));
    return (res.genres || []).map((g) => ({ id: g.id, name: g.name }));
  }
  // For "all", merge and deduplicate genres by name
  const [movieRes, tvRes] = await Promise.all([
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);
  const genreMap = new Map<string, GenreOption>();
  (movieRes?.genres || []).forEach((g) => {
    genreMap.set(g.name.toLowerCase(), { id: g.id, name: g.name });
  });
  (tvRes?.genres || []).forEach((g) => {
    if (!genreMap.has(g.name.toLowerCase())) {
      genreMap.set(g.name.toLowerCase(), { id: g.id, name: g.name });
    }
  });
  return Array.from(genreMap.values());
};

export interface BrowseGridOptions {
  type?: "all" | "movies" | "tv";
  country?: string;
  genre?: string | number;
  sort?: "all" | "popular" | "most-rated" | "new-releases" | "worst-rated" | "title-asc" | "title-desc";
  page?: number;
  limit?: number;
}

/**
 * Service to fetch paginated browse grid items with filters (Type, Country, Genre, Sort)
 */
export const getBrowseGridService = async ({
  type = "all",
  country = "all",
  genre,
  sort = "all",
  page = 1,
  limit = 20,
}: BrowseGridOptions = {}): Promise<BrowseGridResponse> => {
  const normalizedCountry =
    country && country.toLowerCase() !== "all" ? country.toUpperCase() : undefined;

  // Helper for sort mapping
  const getSortBy = (media: "movie" | "tv") => {
    switch (sort) {
      case "most-rated":
        return "vote_average.desc";
      case "worst-rated":
        return "vote_average.asc";
      case "new-releases":
        return media === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
      case "title-asc":
        return media === "movie" ? "original_title.asc" : "name.asc";
      case "title-desc":
        return media === "movie" ? "original_title.desc" : "name.desc";
      case "all":
      case "popular":
      default:
        return "popularity.desc";
    }
  };

  // Fetch genre maps in parallel
  const [movieGenreData, tvGenreData] = await Promise.all([
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const movieGenreMap: Record<number, string> = {};
  movieGenreData?.genres?.forEach((g) => {
    movieGenreMap[g.id] = g.name;
  });

  const tvGenreMap: Record<number, string> = {};
  tvGenreData?.genres?.forEach((g) => {
    tvGenreMap[g.id] = g.name;
  });

  if (type === "movies") {
    const params: Record<string, string | number | boolean | undefined> = {
      sort_by: getSortBy("movie"),
      page,
      include_adult: false,
    };
    if (normalizedCountry) {
      params.with_origin_country = normalizedCountry;
    }
    if (genre) {
      params.with_genres = String(genre);
    }
    if (sort === "most-rated" || sort === "worst-rated") {
      params["vote_count.gte"] = 50;
    } else if (sort === "new-releases") {
      params["vote_count.gte"] = 5;
      params["primary_release_date.lte"] = new Date().toISOString().split("T")[0];
    }

    const movieRes = await findDiscoverMoviesFromTMDB(params);
    const rawMovies = movieRes?.results || [];
    const validMovies = rawMovies.filter((m) => Boolean(m.title) && Boolean(m.poster_path));
    const items: BrowseItem[] = validMovies.slice(0, limit).map((m) => ({
      id: String(m.id),
      title: m.title ?? "",
      rating:
        typeof m.vote_average === "number" && m.vote_average > 0
          ? m.vote_average.toFixed(1)
          : "0.0",
      genres: (m.genre_ids || []).map((id) => movieGenreMap[id]).filter(Boolean),
      type: "Movie",
      poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : "",
      year: m.release_date ? m.release_date.slice(0, 4) : undefined,
    }));

    return {
      items,
      page,
      totalPages: movieRes?.total_pages || 1,
      totalResults: movieRes?.total_results || items.length,
      hasMore: (movieRes?.total_pages || 1) > page,
    };
  }

  if (type === "tv") {
    const params: Record<string, string | number | boolean | undefined> = {
      sort_by: getSortBy("tv"),
      page,
      include_adult: false,
    };
    if (normalizedCountry) {
      params.with_origin_country = normalizedCountry;
    }
    if (genre) {
      params.with_genres = String(genre);
    }
    if (sort === "most-rated" || sort === "worst-rated") {
      params["vote_count.gte"] = 30;
    } else if (sort === "new-releases") {
      params["vote_count.gte"] = 5;
      params["first_air_date.lte"] = new Date().toISOString().split("T")[0];
    }

    const tvRes = await findDiscoverTVFromTMDB(params);
    const rawSeries = tvRes?.results || [];
    const validSeries = rawSeries.filter((s) => Boolean(s.name) && Boolean(s.poster_path));
    const items: BrowseItem[] = validSeries.slice(0, limit).map((s) => ({
      id: String(s.id),
      title: s.name ?? "",
      rating:
        typeof s.vote_average === "number" && s.vote_average > 0
          ? s.vote_average.toFixed(1)
          : "0.0",
      genres: (s.genre_ids || []).map((id) => tvGenreMap[id]).filter(Boolean),
      type: "TV Series",
      poster: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
      backdrop: s.backdrop_path ? `https://image.tmdb.org/t/p/original${s.backdrop_path}` : "",
      season: "S1",
      year: s.first_air_date ? s.first_air_date.slice(0, 4) : undefined,
    }));

    return {
      items,
      page,
      totalPages: tvRes?.total_pages || 1,
      totalResults: tvRes?.total_results || items.length,
      hasMore: (tvRes?.total_pages || 1) > page,
    };
  }

  // When type === "all"
  const movieParams: Record<string, string | number | boolean | undefined> = {
    sort_by: getSortBy("movie"),
    page,
    include_adult: false,
  };
  const tvParams: Record<string, string | number | boolean | undefined> = {
    sort_by: getSortBy("tv"),
    page,
    include_adult: false,
  };
  if (normalizedCountry) {
    movieParams.with_origin_country = normalizedCountry;
    tvParams.with_origin_country = normalizedCountry;
  }
  if (genre) {
    movieParams.with_genres = String(genre);
    tvParams.with_genres = String(genre);
  }
  if (sort === "most-rated" || sort === "worst-rated") {
    movieParams["vote_count.gte"] = 50;
    tvParams["vote_count.gte"] = 30;
  } else if (sort === "new-releases") {
    const today = new Date().toISOString().split("T")[0];
    movieParams["vote_count.gte"] = 5;
    movieParams["primary_release_date.lte"] = today;
    tvParams["vote_count.gte"] = 5;
    tvParams["first_air_date.lte"] = today;
  }

  const [movieRes, tvRes] = await Promise.all([
    findDiscoverMoviesFromTMDB(movieParams).catch(() => null),
    findDiscoverTVFromTMDB(tvParams).catch(() => null),
  ]);

  const rawMovies = (movieRes?.results || []).filter(
    (m) => Boolean(m.title) && Boolean(m.poster_path)
  );
  const rawSeries = (tvRes?.results || []).filter(
    (s) => Boolean(s.name) && Boolean(s.poster_path)
  );

  const movieItems: BrowseItem[] = rawMovies.map((m) => ({
    id: String(m.id),
    title: m.title ?? "",
    rating:
      typeof m.vote_average === "number" && m.vote_average > 0
        ? m.vote_average.toFixed(1)
        : "0.0",
    genres: (m.genre_ids || []).map((id) => movieGenreMap[id]).filter(Boolean),
    type: "Movie",
    poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : "",
    year: m.release_date ? m.release_date.slice(0, 4) : undefined,
  }));

  const tvItems: BrowseItem[] = rawSeries.map((s) => ({
    id: String(s.id),
    title: s.name ?? "",
    rating:
      typeof s.vote_average === "number" && s.vote_average > 0
        ? s.vote_average.toFixed(1)
        : "0.0",
    genres: (s.genre_ids || []).map((id) => tvGenreMap[id]).filter(Boolean),
    type: "TV Series",
    poster: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
    backdrop: s.backdrop_path ? `https://image.tmdb.org/t/p/original${s.backdrop_path}` : "",
    season: "S1",
    year: s.first_air_date ? s.first_air_date.slice(0, 4) : undefined,
  }));

  const interleaved: BrowseItem[] = [];
  const maxLen = Math.max(movieItems.length, tvItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < movieItems.length) interleaved.push(movieItems[i]);
    if (i < tvItems.length) interleaved.push(tvItems[i]);
  }

  const selectedItems = interleaved.slice(0, limit);
  const totalPages = Math.max(movieRes?.total_pages || 1, tvRes?.total_pages || 1);
  const totalResults = (movieRes?.total_results || 0) + (tvRes?.total_results || 0);

  return {
    items: selectedItems,
    page,
    totalPages,
    totalResults,
    hasMore: totalPages > page,
  };
};

/**
 * Service to fetch all official countries configured in TMDB, sorted alphabetically
 */
export const getCountriesService = async (): Promise<CountryOption[]> => {
  const data = await findCountriesFromTMDB().catch(() => []);
  if (!Array.isArray(data) || data.length === 0) return [];
  const sorted = data.slice().sort((a, b) =>
    a.english_name.localeCompare(b.english_name)
  );
  return sorted.map((c) => ({
    code: c.iso_3166_1,
    name: c.english_name,
  }));
};

export interface SearchOptions {
  query?: string;
  page?: number;
  limit?: number;
}

/**
 * Service to search movies and TV shows by query keyword
 */
export const searchContentService = async ({
  query = "",
  page = 1,
  limit = 20,
}: SearchOptions = {}): Promise<BrowseGridResponse> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return await getBrowseGridService({
      type: "all",
      sort: "popular",
      page,
      limit,
    });
  }

  // Fetch genre maps in parallel
  const [movieGenreData, tvGenreData] = await Promise.all([
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const movieGenreMap: Record<number, string> = {};
  movieGenreData?.genres?.forEach((g) => {
    movieGenreMap[g.id] = g.name;
  });

  const tvGenreMap: Record<number, string> = {};
  tvGenreData?.genres?.forEach((g) => {
    tvGenreMap[g.id] = g.name;
  });

  // Search movies and TV series in parallel
  const [movieRes, tvRes] = await Promise.all([
    findSearchMoviesFromTMDB(trimmed, page).catch(() => null),
    findSearchTVFromTMDB(trimmed, page).catch(() => null),
  ]);

  const rawMovies = (movieRes?.results || []).filter(
    (m) => Boolean(m.title) && Boolean(m.poster_path)
  );
  const rawSeries = (tvRes?.results || []).filter(
    (s) => Boolean(s.name) && Boolean(s.poster_path)
  );

  const movieItems: BrowseItem[] = rawMovies.map((m) => ({
    id: String(m.id),
    title: m.title ?? "",
    rating:
      typeof m.vote_average === "number" && m.vote_average > 0
        ? m.vote_average.toFixed(1)
        : "0.0",
    genres: (m.genre_ids || []).map((id) => movieGenreMap[id]).filter(Boolean),
    type: "Movie",
    poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : "",
    year: m.release_date ? m.release_date.slice(0, 4) : undefined,
  }));

  const tvItems: BrowseItem[] = rawSeries.map((s) => ({
    id: String(s.id),
    title: s.name ?? "",
    rating:
      typeof s.vote_average === "number" && s.vote_average > 0
        ? s.vote_average.toFixed(1)
        : "0.0",
    genres: (s.genre_ids || []).map((id) => tvGenreMap[id]).filter(Boolean),
    type: "TV Series",
    poster: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
    backdrop: s.backdrop_path ? `https://image.tmdb.org/t/p/original${s.backdrop_path}` : "",
    season: "S1",
    year: s.first_air_date ? s.first_air_date.slice(0, 4) : undefined,
  }));

  const interleaved: BrowseItem[] = [];
  const maxLen = Math.max(movieItems.length, tvItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < movieItems.length) interleaved.push(movieItems[i]);
    if (i < tvItems.length) interleaved.push(tvItems[i]);
  }

  const selectedItems = interleaved.slice(0, limit);
  const totalPages = Math.max(movieRes?.total_pages || 1, tvRes?.total_pages || 1);
  const totalResults = (movieRes?.total_results || 0) + (tvRes?.total_results || 0);

  return {
    items: selectedItems,
    page,
    totalPages,
    totalResults,
    hasMore: totalPages > page,
  };
};

/**
 * Service to fetch releases (both Movies and TV Series) by year and region, grouped by month descending
 */
export const getReleasesService = async ({
  year,
  region = "worldwide",
}: {
  year?: number;
  region?: string;
}): Promise<ReleasesResponse> => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1 to 12
  const todayStr = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Target year defaults to current year, clamped between 2000 and currentYear
  const targetYear = Math.max(2000, Math.min(currentYear, Number(year) || currentYear));
  const isCurrentYear = targetYear === currentYear;

  // Rule: If selectedYear === currentYear -> currentMonth down to January
  // Rule: If selectedYear < currentYear -> December (12) down to January
  const maxMonth = isCurrentYear ? currentMonth : 12;

  // Determine end date for the query
  const lastDayOfMaxMonth = new Date(targetYear, maxMonth, 0).getDate();
  const endDateStr = `${targetYear}-${String(maxMonth).padStart(2, "0")}-${String(lastDayOfMaxMonth).padStart(2, "0")}`;
  const startDateStr = `${targetYear}-01-01`;

  const isWorldwide = !region || region.toLowerCase() === "worldwide";
  const regionCode = isWorldwide ? undefined : region.toUpperCase();

  // Load genres mapping for both Movies and TV Series in parallel
  const [movieGenresRes, tvGenresRes] = await Promise.all([
    findMovieGenresFromTMDB().catch(() => ({ genres: [] })),
    findTVGenresFromTMDB().catch(() => ({ genres: [] })),
  ]);

  const movieGenreMap: Record<number, string> = {};
  (movieGenresRes.genres || []).forEach((g) => {
    movieGenreMap[g.id] = g.name;
  });

  const tvGenreMap: Record<number, string> = {};
  (tvGenresRes.genres || []).forEach((g) => {
    tvGenreMap[g.id] = g.name;
  });

  // Movie Query Parameters
  const movieBaseParams: Record<string, string | number | boolean | undefined> = {
    include_adult: false,
    include_video: false,
    language: "en-US",
  };

  if (regionCode) {
    movieBaseParams.region = regionCode;
    movieBaseParams["release_date.gte"] = startDateStr;
    movieBaseParams["release_date.lte"] = endDateStr;
    movieBaseParams.with_release_type = "1|2|3|4|5|6";
  } else {
    movieBaseParams["primary_release_date.gte"] = startDateStr;
    movieBaseParams["primary_release_date.lte"] = endDateStr;
  }

  const movieSortParam = regionCode ? "release_date.desc" : "primary_release_date.desc";

  // TV Query Parameters
  const tvBaseParams: Record<string, string | number | boolean | undefined> = {
    include_adult: false,
    language: "en-US",
  };

  if (regionCode) {
    tvBaseParams.with_origin_country = regionCode;
    tvBaseParams["air_date.gte"] = startDateStr;
    tvBaseParams["air_date.lte"] = endDateStr;
  } else {
    tvBaseParams["air_date.gte"] = startDateStr;
    tvBaseParams["air_date.lte"] = endDateStr;
  }

  // Fetch Movie and TV lists in parallel
  const [
    datePage1,
    datePage2,
    popPage1,
    popPage2,
    tvDatePage1,
    tvPopPage1,
    tvPopPage2,
  ] = await Promise.allSettled([
    findDiscoverMoviesFromTMDB({ ...movieBaseParams, sort_by: movieSortParam, page: 1 }),
    findDiscoverMoviesFromTMDB({ ...movieBaseParams, sort_by: movieSortParam, page: 2 }),
    findDiscoverMoviesFromTMDB({ ...movieBaseParams, sort_by: "popularity.desc", page: 1 }),
    findDiscoverMoviesFromTMDB({ ...movieBaseParams, sort_by: "popularity.desc", page: 2 }),
    findDiscoverTVFromTMDB({ ...tvBaseParams, sort_by: "first_air_date.desc", page: 1 }),
    findDiscoverTVFromTMDB({ ...tvBaseParams, sort_by: "popularity.desc", page: 1 }),
    findDiscoverTVFromTMDB({ ...tvBaseParams, sort_by: "popularity.desc", page: 2 }),
  ]);

  const rawMovieList: TMDBMovieSummary[] = [];
  const addMovieResults = (settled: PromiseSettledResult<{ results?: TMDBMovieSummary[] }>) => {
    if (settled.status === "fulfilled" && Array.isArray(settled.value?.results)) {
      rawMovieList.push(...settled.value.results);
    }
  };
  addMovieResults(datePage1);
  addMovieResults(datePage2);
  addMovieResults(popPage1);
  addMovieResults(popPage2);

  const rawTVList: TMDBTVSummary[] = [];
  const addTVResults = (settled: PromiseSettledResult<{ results?: TMDBTVSummary[] }>) => {
    if (settled.status === "fulfilled" && Array.isArray(settled.value?.results)) {
      rawTVList.push(...settled.value.results);
    }
  };
  addTVResults(tvDatePage1);
  addTVResults(tvPopPage1);
  addTVResults(tvPopPage2);

  const nowPlayingMovieIds = new Set<number>();
  const onTheAirTVIds = new Set<number>();

  // If current year, also fetch upcoming movies, now playing movies, and on-the-air TV
  if (isCurrentYear) {
    try {
      const [upcomingRes, nowPlayingRes, onTheAirRes] = await Promise.allSettled([
        findUpcomingMoviesFromTMDB(1),
        findNowPlayingMoviesFromTMDB(1),
        findOnTheAirTVFromTMDB(1),
      ]);
      if (upcomingRes.status === "fulfilled" && Array.isArray(upcomingRes.value?.results)) {
        rawMovieList.push(...upcomingRes.value.results);
      }
      if (nowPlayingRes.status === "fulfilled" && Array.isArray(nowPlayingRes.value?.results)) {
        rawMovieList.push(...nowPlayingRes.value.results);
        for (const m of nowPlayingRes.value.results) {
          if (m.id) nowPlayingMovieIds.add(m.id);
        }
      }
      if (onTheAirRes.status === "fulfilled" && Array.isArray(onTheAirRes.value?.results)) {
        rawTVList.push(...onTheAirRes.value.results);
        for (const t of onTheAirRes.value.results) {
          if (t.id) onTheAirTVIds.add(t.id);
        }
      }
    } catch {
      // ignore
    }
  }

  // 1. Process Movies
  const seenMovieIds = new Set<number>();
  const validMovies: ReleaseItem[] = [];

  for (const movie of rawMovieList) {
    if (!movie.id || seenMovieIds.has(movie.id)) continue;
    seenMovieIds.add(movie.id);

    if (!movie.release_date || typeof movie.release_date !== "string") continue;
    const parts = movie.release_date.split("-");
    if (parts.length !== 3) continue;

    const mYear = parseInt(parts[0], 10);
    const mMonth = parseInt(parts[1], 10);
    const mDay = parseInt(parts[2], 10);

    if (isNaN(mYear) || isNaN(mMonth) || isNaN(mDay)) continue;
    if (mYear !== targetYear) continue;
    if (mMonth > maxMonth) continue;

    const genres = (movie.genre_ids || [])
      .map((id) => movieGenreMap[id])
      .filter(Boolean);

    const isUpcoming = movie.release_date > todayStr;
    const isNowPlaying =
      !isUpcoming &&
      (nowPlayingMovieIds.has(movie.id) ||
        new Date(movie.release_date).getTime() >=
          now.getTime() - 45 * 24 * 60 * 60 * 1000);

    const status: "Released" | "Upcoming" | "Now Playing" = isUpcoming
      ? "Upcoming"
      : isNowPlaying
      ? "Now Playing"
      : "Released";

    const dayFormatted = String(mDay).padStart(2, "0");

    validMovies.push({
      id: String(movie.id),
      title: movie.title || "Untitled",
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
        : "",
      backdrop: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : "",
      releaseDate: movie.release_date,
      day: dayFormatted,
      genres,
      overview: movie.overview || "",
      voteAverage:
        typeof movie.vote_average === "number"
          ? parseFloat(movie.vote_average.toFixed(1))
          : 0,
      status,
      mediaType: "movie",
    });
  }

  // 2. Process TV Series
  const seenTVIds = new Set<number>();
  const candidateTVs: TMDBTVSummary[] = [];

  for (const tv of rawTVList) {
    if (!tv.id || seenTVIds.has(tv.id)) continue;
    seenTVIds.add(tv.id);

    if (!tv.first_air_date || typeof tv.first_air_date !== "string") continue;
    const parts = tv.first_air_date.split("-");
    if (parts.length !== 3) continue;

    const tYear = parseInt(parts[0], 10);
    const tMonth = parseInt(parts[1], 10);
    const tDay = parseInt(parts[2], 10);

    if (isNaN(tYear) || isNaN(tMonth) || isNaN(tDay)) continue;
    if (tYear !== targetYear) continue;
    if (tMonth > maxMonth) continue;

    candidateTVs.push(tv);
  }

  // Fetch season details for up to 15 top candidate TV shows to enrich with S?? E??
  const tvDetailsMap = new Map<number, { seasonInfo: string }>();
  const tvDetailPromises = candidateTVs.slice(0, 15).map(async (tv) => {
    try {
      const details = await findTVDetailsWithRatingsFromTMDB(tv.id);
      if (details && Array.isArray(details.seasons) && details.seasons.length > 0) {
        const regularSeasons = details.seasons.filter((s) => s.season_number > 0);
        // Find season released in target year or the latest season
        const matched =
          regularSeasons.find((s) => s.air_date && s.air_date.startsWith(String(targetYear))) ||
          regularSeasons[regularSeasons.length - 1];

        if (matched) {
          const sNum = matched.season_number;
          const epCount = matched.episode_count || 1;
          const sInfo = epCount > 1 ? `S${sNum} E1-${epCount}` : `S${sNum} E1`;
          tvDetailsMap.set(tv.id, { seasonInfo: sInfo });
          return;
        }
      }
      tvDetailsMap.set(tv.id, { seasonInfo: "S1" });
    } catch {
      tvDetailsMap.set(tv.id, { seasonInfo: "S1" });
    }
  });

  await Promise.allSettled(tvDetailPromises);

  const validTVSeries: ReleaseItem[] = [];

  for (const tv of candidateTVs) {
    const tvAirDate = tv.first_air_date as string;
    const parts = tvAirDate.split("-");
    const tDay = parseInt(parts[2], 10);

    const genres = (tv.genre_ids || [])
      .map((id) => tvGenreMap[id])
      .filter(Boolean);

    const isUpcoming = tvAirDate > todayStr;
    const isNowPlaying =
      !isUpcoming &&
      (onTheAirTVIds.has(tv.id) ||
        new Date(tvAirDate).getTime() >=
          now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const status: "Released" | "Upcoming" | "Now Playing" = isUpcoming
      ? "Upcoming"
      : isNowPlaying
      ? "Now Playing"
      : "Released";

    const dayFormatted = String(tDay).padStart(2, "0");
    const seasonInfo = tvDetailsMap.get(tv.id)?.seasonInfo || "S1";

    validTVSeries.push({
      id: String(tv.id),
      title: tv.name || "Untitled",
      poster: tv.poster_path
        ? `https://image.tmdb.org/t/p/w342${tv.poster_path}`
        : "",
      backdrop: tv.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`
        : "",
      releaseDate: tv.first_air_date as string,
      day: dayFormatted,
      genres,
      overview: tv.overview || "",
      voteAverage:
        typeof tv.vote_average === "number"
          ? parseFloat(tv.vote_average.toFixed(1))
          : 0,
      status,
      mediaType: "tv",
      seasonInfo,
    });
  }

  // Combine both Movies and TV series
  const allReleases: ReleaseItem[] = [...validMovies, ...validTVSeries];

  const MONTH_NAMES = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Group by month descending: from maxMonth down to 1
  const monthGroups: ReleaseMonthGroup[] = [];

  for (let m = maxMonth; m >= 1; m--) {
    const monthStr = String(m).padStart(2, "0");
    const monthReleases = allReleases.filter((item) => {
      const parts = item.releaseDate.split("-");
      return parts[1] === monthStr;
    });

    // Sort within month: release date descending (newest release day first)
    monthReleases.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

    // Hide empty months
    if (monthReleases.length > 0) {
      monthGroups.push({
        month: m,
        name: MONTH_NAMES[m],
        releases: monthReleases,
      });
    }
  }

  return {
    year: targetYear,
    region: region || "worldwide",
    months: monthGroups,
  };
};




