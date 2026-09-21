"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Film,
  Bookmark,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { UpcomingMovie } from "@/domain/movie/movie.types";

export type MovieSlide = UpcomingMovie;

export default function HeroSlider() {
  const [movies, setMovies] = useState<UpcomingMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTrailerId, setActiveTrailerId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchUpcomingMovies() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/movies/upcoming");
        if (!res.ok) {
          throw new Error(`Failed to fetch upcoming movies: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.movies && Array.isArray(data.movies) && data.movies.length > 0) {
          setMovies(data.movies);
        }
      } catch (err) {
        console.error("Error fetching hero upcoming movies:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUpcomingMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentMovie = movies[currentIndex] || movies[0];

  // Auto-play slide timer
  useEffect(() => {
    if (movies.length <= 1 || isPaused || activeTrailerId !== null) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, activeTrailerId, movies.length]);

  const handleNext = () => {
    if (movies.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const handlePrev = () => {
    if (movies.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const toggleWatchlist = (movie: UpcomingMovie) => {
    const isCurrentlyAdded = !!watchlist[movie.id];
    const willBeAdded = !isCurrentlyAdded;

    setWatchlist((prev) => ({ ...prev, [movie.id]: willBeAdded }));

    if (willBeAdded) {
      toast.success(`Added "${movie.title}" to Watchlist!`, {
        id: `watchlist-${movie.id}`,
        icon: "🔖",
        style: {
          borderRadius: "12px",
          background: "#161922",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
        },
      });
    } else {
      toast(`Removed "${movie.title}" from Watchlist`, {
        id: `watchlist-${movie.id}`,
        icon: "🗑️",
        style: {
          borderRadius: "12px",
          background: "#161922",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
        },
      });
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);

    toast(nextState ? "Audio Muted" : "Audio Unmuted", {
      id: "audio-toggle",
      icon: nextState ? "🔇" : "🔊",
      style: {
        borderRadius: "12px",
        background: "#161922",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
      },
    });
  };

  if (isLoading && movies.length === 0) {
    return (
      <div className="relative w-full h-[92vh] min-h-[620px] max-h-[960px] bg-[#07090e] overflow-hidden select-none animate-pulse">
        {/* Shimmer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16 pt-24">
          <div className="max-w-2xl space-y-4">
            {/* Tag Skeleton */}
            <div className="w-32 h-6 rounded-full bg-white/10" />
            {/* Title Skeleton */}
            <div className="w-3/4 sm:w-2/3 h-10 sm:h-14 rounded-2xl bg-white/10" />
            {/* Meta row Skeleton */}
            <div className="w-48 h-4 rounded-md bg-white/10" />
            {/* Description Skeleton */}
            <div className="space-y-2 pt-1">
              <div className="w-full h-3 rounded bg-white/10" />
              <div className="w-5/6 h-3 rounded bg-white/10" />
            </div>
            {/* Buttons Skeleton */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-36 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/20" />
              <div className="w-36 h-11 rounded-xl bg-white/10 border border-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0 || !currentMovie) {
    return null;
  }

  const hasTrailer = Boolean(currentMovie.trailerId && currentMovie.trailerId.trim() !== "");

  return (
    <div
      className="relative w-full h-[92vh] min-h-[620px] max-h-[960px] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides with Crossfade Animation */}
      {movies.map((movie, index) => {
        const isActive = index === currentIndex;

        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* High-res Movie Backdrop Image with Cinematic Ken Burns Zoom */}
            <div className="relative w-full h-full">
              {movie.backdrop ? (
                <Image
                  src={movie.backdrop}
                  alt={movie.title}
                  fill
                  priority={index === 0}
                  className={`object-cover object-center transition-transform duration-[4500ms] ease-out ${
                    isActive ? "scale-108" : "scale-100"
                  }`}
                  sizes="100vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
              )}

              {/* Cinematic Vignette & Gradients Overlay */}
              {/* Left text-protection gradient (reduced shadow) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 lg:w-[65%]" />
              {/* Bottom fade gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              {/* Top header fade */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-transparent z-10" />
            </div>
          </div>
        );
      })}

      {/* Main Content Info */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16 pt-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6">
          {/* Left Column: Movie Info & Buttons */}
          <div
            key={currentMovie.id}
            className="max-w-2xl lg:max-w-3xl space-y-3.5 sm:space-y-4 lg:space-y-5"
          >
            {/* Tag Badge */}
            {currentMovie.tag && (
              <div className="animate-hero-tag">
                <span className="inline-flex font-logo items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs sm:text-[13px] font-medium text-zinc-200 tracking-wide shadow-sm">
                  {currentMovie.tag}
                </span>
              </div>
            )}

            {/* Movie Title */}
            <h1 className="animate-hero-title text-2xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {currentMovie.title}
            </h1>

            {/* Metadata Details Row: Year & Genres */}
            <div className="animate-hero-meta flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-zinc-300 font-medium">
              {currentMovie.year && <span>{currentMovie.year}</span>}
              {currentMovie.year && currentMovie.genres.length > 0 && (
                <span className="text-zinc-500">•</span>
              )}
              {currentMovie.genres.length > 0 && (
                <span>{currentMovie.genres.join(" • ")}</span>
              )}
            </div>

            {/* Description Paragraph */}
            {currentMovie.description && (
              <p className="animate-hero-desc text-zinc-300/90 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3 max-w-2xl font-normal drop-shadow-md">
                {currentMovie.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="animate-hero-buttons flex flex-wrap items-center gap-3 sm:gap-3.5 pt-1 sm:pt-2 font-custom1">
              {/* Watch Trailer Button (Green) - Displayed only if trailerId is present */}
              {hasTrailer && (
                <button
                  onClick={() => setActiveTrailerId(currentMovie.trailerId)}
                  className="font-custom1 inline-flex items-center gap-2 px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-xl bg-[#489d6e] hover:bg-[#3b875d] text-white font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <Film className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
                  <span>Watch Trailer</span>
                </button>
              )}

              {/* Add Watchlist Button */}
              <button
                onClick={() => toggleWatchlist(currentMovie)}
                className="font-custom1 inline-flex items-center gap-2 px-4.5 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-xl bg-[#1c202a]/80 hover:bg-[#282e3c] text-white font-medium text-xs sm:text-sm lg:text-base backdrop-blur-md border border-white/15 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer group/fav"
              >
                {watchlist[currentMovie.id] ? (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400 stroke-yellow-400 transition-transform duration-300 scale-110" />
                    <span>Added to Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2] text-white transition-all duration-200 group-hover/fav:text-yellow-400 group-hover/fav:scale-110" />
                    <span>Add Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right/Bottom Controls (Pagination Dots + Audio Toggle) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-start lg:self-end pt-2 lg:pt-0 z-30">
            {/* Pagination Dots */}
            {movies.length > 1 && (
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-full border border-white/10 shadow-lg">
                {movies.map((_, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`transition-all duration-500 rounded-full cursor-pointer relative overflow-hidden ${
                        isActive
                          ? "w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                          : "w-2 h-2 bg-white/35 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  );
                })}
              </div>
            )}

            {/* Audio Mute / Unmute Button */}
            <button
              onClick={toggleMute}
              className="w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-[#1c202a]/80 hover:bg-[#282e3c] backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Toggle Audio"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-zinc-300" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Prev / Next Slide Arrows on Hover */}
      {movies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* YouTube Trailer Modal */}
      {activeTrailerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setActiveTrailerId(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer border border-white/20"
              aria-label="Close Trailer"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeTrailerId}?autoplay=1&rel=0`}
              title="Movie Trailer"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
