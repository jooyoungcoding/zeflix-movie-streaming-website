import React from "react";
import { notFound, redirect } from "next/navigation";
import { Tv } from "lucide-react";
import {
  getTVSeriesDetailService,
  parseDurationToSeconds,
} from "@/features/movie/service/movie.service";
import { defaultPlaybackService } from "@/features/playback/service/playback.service";
import {
  determineWatchCategory,
  buildWatchUrl,
  buildNextEpisodeUrl,
} from "@/features/playback/service/watch-routing.service";
import { WatchCategory } from "@/features/playback/types/playback.types";
import VideoPlayer from "@/components/player/VideoPlayer";
import EpisodesTab from "@/components/detail/EpisodesTab";
import BackButton from "@/components/BackButton";

interface SharedTvWatchPageProps {
  id: string;
  season: string;
  episode: string;
  category: WatchCategory;
}

export default async function SharedTvWatchPage({
  id,
  season,
  episode,
  category,
}: SharedTvWatchPageProps) {
  const sNum = parseInt(season, 10) || 1;
  const epNum = parseInt(episode, 10) || 1;

  const tv = await getTVSeriesDetailService(id, sNum);

  if (!tv) {
    notFound();
  }

  const tmdbId = String(tv.id || id || "").trim();

  // Centralized media validation: Ensure URL category matches actual content
  const verifiedCategory = determineWatchCategory({
    tmdbId,
    title: tv.title,
    genres: tv.genres,
    originCountry: tv.originCountry,
    productionCountries: tv.productionCountries,
    originalLanguage: tv.originalLanguage,
    mediaType: "tv",
  });

  if (category !== verifiedCategory) {
    redirect(
      buildWatchUrl({
        type: "tv",
        tmdbId: id,
        category: verifiedCategory,
        episode: epNum,
        season: sNum,
      })
    );
  }

  // Find current episode details if available (check both seasonal episode number and cumulative display episode number)
  const currentEp = tv.episodes.find(
    (e) =>
      e.seasonNumber === sNum &&
      (e.episodeNumber === epNum || e.displayEpisodeNumber === epNum)
  );

  // Canonical season episode number (e.g. TMDB episode 1 for season 3 episode 51)
  const effectiveEpNum = currentEp?.episodeNumber ?? epNum;

  // Boundary check: If requested episode was not found and exceeds current season count, advance to next season if available
  if (!currentEp && tv.episodes.length > 0 && epNum > tv.episodes.length) {
    const nextSeason = tv.seasons.find((s) => s.seasonNumber === sNum + 1);
    if (nextSeason && nextSeason.episodeCount > 0) {
      redirect(
        buildWatchUrl({
          type: "tv",
          tmdbId: id,
          category: verifiedCategory,
          season: sNum + 1,
          episode: 1,
        })
      );
    }
  }

  // Preserve category route for next episode (including cross-season progression)
  let nextEpisodeUrl: string | undefined = undefined;
  const currentEpIndex = tv.episodes.findIndex(
    (e) =>
      e.seasonNumber === sNum &&
      (e.episodeNumber === effectiveEpNum || e.displayEpisodeNumber === epNum)
  );
  const expectedDuration = parseDurationToSeconds(currentEp?.runtime);

  if (currentEpIndex !== -1 && currentEpIndex < tv.episodes.length - 1) {
    const nextEp = tv.episodes[currentEpIndex + 1];
    nextEpisodeUrl = buildNextEpisodeUrl(
      category,
      id,
      nextEp.episodeNumber,
      nextEp.seasonNumber ?? sNum
    );
  } else if (currentEpIndex === tv.episodes.length - 1) {
    // Season ended: seamlessly move to next season episode 1 if available
    const nextSeason = tv.seasons.find((s) => s.seasonNumber === sNum + 1);
    if (nextSeason && nextSeason.episodeCount > 0) {
      nextEpisodeUrl = buildNextEpisodeUrl(category, id, 1, sNum + 1);
    }
  } else if (category === "sentai" && (tv.episodes.length === 0 || effectiveEpNum < 55)) {
    nextEpisodeUrl = buildNextEpisodeUrl(category, id, effectiveEpNum + 1, sNum);
  } else if (tv.episodes.length > 0 && effectiveEpNum < tv.episodes.length) {
    nextEpisodeUrl = buildNextEpisodeUrl(category, id, effectiveEpNum + 1, sNum);
  }

  // Resolve video playback session through centralized PlaybackService
  const playbackSession = await defaultPlaybackService.getTvPlayback(
    tmdbId,
    sNum,
    effectiveEpNum,
    tv.title,
    {
      category,
      genres: tv.genres,
      originCountry: tv.originCountry,
      originalLanguage: tv.originalLanguage,
      title: tv.title,
      franchise: category === "sentai" ? "Super Sentai" : undefined,
    }
  );

  return (
    <div className="bg-black text-white pt-16 sm:pt-20 pb-8">
      {/* Main Watch Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6">
        {/* Navigation & Series Info Row */}
        <div className="flex items-center justify-between gap-4">
          <BackButton fallbackUrl={`/tv/${id}`} />

          <div className="flex items-center gap-2.5">
            <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-base sm:text-lg lg:text-xl text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {tv.title}
            </span>
            {tv.year ? (
              <span className="text-xs text-zinc-400">({tv.year})</span>
            ) : tv.releaseDate ? (
              <span className="text-xs text-zinc-400">
                ({new Date(tv.releaseDate).getFullYear()})
              </span>
            ) : null}
          </div>
        </div>

        {/* Video Player Container with Next Episode Support */}
        <VideoPlayer
          tmdbId={tmdbId}
          type="tv"
          category={category}
          title={tv.title}
          releaseYear={
            tv.year
              ? parseInt(tv.year, 10)
              : tv.releaseDate
              ? new Date(tv.releaseDate).getFullYear()
              : 2024
          }
          season={sNum}
          episode={effectiveEpNum}
          episodeId={currentEp?.id ? String(currentEp.id) : undefined}
          playbackSession={playbackSession}
          poster={currentEp?.still || tv.backdrop || tv.poster}
          nextEpisodeUrl={nextEpisodeUrl}
          tvId={tmdbId}
          currentSeason={sNum}
          currentEpisode={effectiveEpNum}
          seasons={tv.seasons}
          episodes={tv.episodes}
          expectedDuration={expectedDuration}
          historyMeta={{
            tvName: tv.title,
            tvPosterPath: tv.poster || null,
            tvBackdropPath: tv.backdrop || null,
            tvFirstAirDate: tv.releaseDate || null,
            tvVoteAverage: parseFloat(tv.rating) || undefined,
            tvOverview: tv.description || null,
            episodeName: currentEp?.title || undefined,
            episodeStillPath: currentEp?.still || null,
            episodeAirDate: currentEp?.airDate || null,
            episodeRuntime: expectedDuration ? Math.floor(expectedDuration / 60) : undefined,
          }}
        />

        {/* Reused EpisodesTab Section */}
        {tv.episodes.length > 0 && (
          <div className="w-full pt-2">
            <EpisodesTab
              key={`${category}-episodes-tab-${id}-${sNum}`}
              tvId={id}
              category={category}
              seasons={tv.seasons}
              initialEpisodes={tv.episodes}
              currentSeasonNumber={sNum}
              activeEpisodeNumber={effectiveEpNum}
              activeSeasonNumber={sNum}
            />
          </div>
        )}
      </div>
    </div>
  );
}
