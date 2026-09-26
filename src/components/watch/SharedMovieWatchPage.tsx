import React from "react";
import { notFound, redirect } from "next/navigation";
import { Film } from "lucide-react";
import { getMovieDetailService } from "@/features/movie/service/movie.service";
import { defaultPlaybackService } from "@/features/playback/service/playback.service";
import {
  determineWatchCategory,
  buildWatchUrl,
} from "@/features/playback/service/watch-routing.service";
import { WatchCategory } from "@/features/playback/types/playback.types";
import VideoPlayer from "@/components/player/VideoPlayer";
import BackButton from "@/components/BackButton";

interface SharedMovieWatchPageProps {
  id: string;
  category: WatchCategory;
}

export default async function SharedMovieWatchPage({
  id,
  category,
}: SharedMovieWatchPageProps) {
  const movie = await getMovieDetailService(id);

  if (!movie) {
    notFound();
  }

  const tmdbId = String(movie.id || id || "").trim();

  // Centralized media validation: Ensure URL category matches actual content
  const verifiedCategory = determineWatchCategory({
    tmdbId,
    title: movie.title,
    genres: movie.genres,
    originCountry: movie.productionCountries,
    productionCountries: movie.productionCountries,
    originalLanguage: movie.originalLanguage,
    mediaType: "movie",
  });

  if (category !== verifiedCategory) {
    redirect(
      buildWatchUrl({
        type: "movie",
        tmdbId: id,
        category: verifiedCategory,
      })
    );
  }

  // Resolve video playback session through centralized PlaybackService
  const playbackSession = await defaultPlaybackService.getMoviePlayback(
    tmdbId,
    movie.title,
    {
      category,
      genres: movie.genres,
      originCountry: movie.productionCountries,
      originalLanguage: movie.originalLanguage,
      title: movie.title,
      franchise: category === "sentai" ? "Super Sentai" : undefined,
    }
  );

  return (
    <div className="bg-black text-white pt-16 sm:pt-20 pb-8">
      {/* Main Watch Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6">
        {/* Navigation & Movie Info Row */}
        <div className="flex items-center justify-between gap-4">
          <BackButton fallbackUrl={`/movies/${id}`} />

          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-base sm:text-lg lg:text-xl text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {movie.title}
            </span>
            {movie.year && (
              <span className="text-xs text-zinc-400">({movie.year})</span>
            )}
          </div>
        </div>

        {/* Video Player Container */}
        <VideoPlayer
          tmdbId={tmdbId}
          imdbId={movie.imdbId}
          type="movie"
          category={category}
          playbackSession={playbackSession}
          title={movie.title}
          releaseYear={
            movie.year
              ? parseInt(movie.year, 10)
              : movie.releaseDate
              ? new Date(movie.releaseDate).getFullYear()
              : 2024
          }
          poster={movie.backdrop || movie.poster}
        />
      </div>
    </div>
  );
}
