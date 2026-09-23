import React from "react";
import { notFound } from "next/navigation";
import { Film } from "lucide-react";
import { getMovieDetailService } from "@/features/movie/service/movie.service";
import { defaultVideoService } from "@/infrastructure/video/video.service";
import VideoPlayer from "@/components/player/VideoPlayer";
import BackButton from "@/components/BackButton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MovieWatchPage({ params }: PageProps) {
  const { id } = await params;
  const movie = await getMovieDetailService(id);

  if (!movie) {
    notFound();
  }

  // Resolve video source through abstraction
  const tmdbId = String(movie.id || id || "").trim();
  const videoSource = await defaultVideoService.getMovieSource(tmdbId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-20 sm:pt-24 pb-16">
      {/* Main Watch Content Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Navigation & Movie Info Row */}
        <div className="flex items-center justify-between gap-4">
          <BackButton fallbackUrl={`/movies/${id}`} />

          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
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
          source={videoSource}
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
