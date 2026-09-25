import { redirect } from "next/navigation";
import { getTVSeriesDetailService } from "@/features/movie/service/movie.service";
import {
  determineWatchCategory,
  buildWatchUrl,
} from "@/features/playback/service/watch-routing.service";

interface PageProps {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
}

/**
 * Backward compatibility redirect for legacy /watch/tv/[id]/[season]/[episode] route
 */
export default async function LegacyTvSeasonEpisodeWatchPage({ params }: PageProps) {
  const { id, episode } = await params;
  const epNum = parseInt(episode, 10) || 1;
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

  redirect(buildWatchUrl({ type: "tv", tmdbId: id, category, episode: epNum }));
}
