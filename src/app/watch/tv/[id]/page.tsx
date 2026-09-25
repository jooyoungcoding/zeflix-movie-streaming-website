import { redirect } from "next/navigation";
import { getTVSeriesDetailService } from "@/features/movie/service/movie.service";
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
 * Backward compatibility redirect for legacy /watch/tv/[id] route
 */
export default async function LegacyTvDefaultWatchPage({ params }: PageProps) {
  const { id } = await params;
  const tv = await getTVSeriesDetailService(id, 1);

  if (!tv) {
    redirect(`/tv/${id}`);
  }

  const category = determineWatchCategory({
    tmdbId: String(tv.id || id || "").trim(),
    title: tv.title,
    genres: tv.genres,
    originCountry: tv.originCountry,
    productionCountries: tv.productionCountries,
    originalLanguage: tv.originalLanguage,
    mediaType: "tv",
  });

  redirect(buildWatchUrl({ type: "tv", tmdbId: id, category, episode: 1 }));
}
