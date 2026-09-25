import { redirect } from "next/navigation";
import { getMovieDetailService } from "@/features/movie/service/movie.service";
import {
  determineWatchCategory,
  buildWatchUrl,
} from "@/features/playback/service/watch-routing.service";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Backward compatibility redirect for legacy /watch/movie/[id] route
 */
export default async function LegacyMovieWatchPage({ params }: PageProps) {
  const { id } = await params;
  const movie = await getMovieDetailService(id);

  if (!movie) {
    redirect(`/movies/${id}`);
  }

  const category = determineWatchCategory({
    tmdbId: String(movie.id || id || "").trim(),
    title: movie.title,
    genres: movie.genres,
    originCountry: movie.productionCountries,
    productionCountries: movie.productionCountries,
    originalLanguage: movie.originalLanguage,
    mediaType: "movie",
  });

  redirect(buildWatchUrl({ type: "movie", tmdbId: id, category }));
}
