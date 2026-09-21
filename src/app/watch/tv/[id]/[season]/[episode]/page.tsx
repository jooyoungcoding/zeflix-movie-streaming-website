import React from "react";
import { notFound } from "next/navigation";
import { Tv } from "lucide-react";
import { getTVSeriesDetailService } from "@/features/movie/service/movie.service";
import { defaultVideoService } from "@/infrastructure/video/video.service";
import VideoPlayer from "@/components/player/VideoPlayer";
import EpisodesTab from "@/components/detail/EpisodesTab";
import BackButton from "@/components/BackButton";

interface PageProps {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
}

export default async function TVWatchPage({ params }: PageProps) {
  const { id, season, episode } = await params;
  const sNum = parseInt(season, 10) || 1;
  const epNum = parseInt(episode, 10) || 1;

  const tv = await getTVSeriesDetailService(id, sNum);

  if (!tv) {
    notFound();
  }

  // Find current episode details if available
  const currentEp = tv.episodes.find(
    (e) => e.seasonNumber === sNum && e.episodeNumber === epNum
  );

  // Resolve video source through abstraction
  const videoSource = await defaultVideoService.getEpisodeSource(
    id,
    sNum,
    epNum
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-20 sm:pt-24 pb-16">
      {/* Main Watch Content Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Navigation & Series Info Row */}
        <div className="flex items-center justify-between gap-4">
          <BackButton fallbackUrl={`/tv/${id}`} />

          <div className="flex items-center gap-2.5">
            <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {tv.title}
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30 shrink-0">
              S{sNum} : E{epNum}
            </span>
          </div>
        </div>

        {/* Video Player Container */}
        <VideoPlayer
          source={videoSource}
          title={`${tv.title} - S${sNum}E${epNum}`}
          poster={currentEp?.still || tv.backdrop || tv.poster}
        />

        {/* Reused EpisodesTab Section (Active episode highlighted with green border) */}
        <div className="w-full pt-2">
          <EpisodesTab
            tvId={id}
            seasons={tv.seasons}
            initialEpisodes={tv.episodes}
            currentSeasonNumber={sNum}
            activeEpisodeNumber={epNum}
            activeSeasonNumber={sNum}
          />
        </div>
      </div>
    </div>
  );
}
