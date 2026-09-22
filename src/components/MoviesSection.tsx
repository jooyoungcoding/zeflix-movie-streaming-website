"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { MovieItem } from "@/domain/movie/movie.types";

export type { MovieItem };

export default function MoviesSection() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchBestMovies() {
      try {
        setIsLoading(true);
        setHasError(false);
        const res = await fetch("/api/movies/best");
        if (!res.ok) {
          throw new Error(`Failed to fetch best movies: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.movies && Array.isArray(data.movies)) {
          setMovies(data.movies);
        }
      } catch (err) {
        console.error("Error fetching best movies:", err);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBestMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [movies]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 350);
    }
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative overflow-hidden animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-56 bg-zinc-800 rounded-md" />
          <div className="h-8 w-20 bg-zinc-800 rounded-xl" />
        </div>
        <div className="flex items-start gap-4 sm:gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[230px] sm:w-[260px] md:w-[280px]"
            >
              <div className="w-full aspect-[16/10] rounded-2xl bg-zinc-800/80 mb-3" />
              <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (hasError) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
            Best Movies For You
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#12151c] border border-white/10 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-zinc-400">Unable to load best movies right now.</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative overflow-hidden movies-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
          Best Movies For You
        </h2>
        <Link
          href="/discover?tab=movies&country=all&genre=all&sort=most-rated#browse-section"
          className="font-custom1 inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-medium text-zinc-300 bg-[#1c202a] hover:bg-[#282e3c] hover:text-white border border-white/10 shadow-sm transition-all duration-200 active:scale-95"
        >
          See all
        </Link>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Dark Shadow Fade */}
        {canScrollLeft && (
          <div className="hidden md:block pointer-events-none absolute left-0 top-0 bottom-0 w-24 lg:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute left-1.5 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Right Dark Shadow Fade */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 lg:w-48 bg-gradient-to-l from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute right-1.5 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Movies Cards Horizontal Scroll List */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 scroll-smooth snap-x px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => {
            const firstGenre = movie.genres && movie.genres.length > 0 ? movie.genres[0] : null;
            const remainingGenres = Math.max((movie.genres?.length || 0) - 1, 0);

            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group shrink-0 w-[230px] sm:w-[260px] md:w-[280px] select-none cursor-pointer snap-start"
              >
                {/* Landscape Thumbnail Box */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#12151c] shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                  {movie.backdrop ? (
                    <Image
                      src={movie.backdrop}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 230px, (max-width: 768px) 260px, 280px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#151922] flex items-center justify-center text-xs text-zinc-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Title & Metadata Below Thumbnail */}
                <div className="mt-3 flex flex-col space-y-1">
                  <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-wide truncate group-hover:text-emerald-400 transition-colors">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{movie.rating}</span>
                    </div>

                    {firstGenre && (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span className="truncate">
                          {firstGenre}
                          {remainingGenres > 0 && ` +${remainingGenres}`}
                        </span>
                      </>
                    )}

                    <span className="text-zinc-600">•</span>
                    <span>{movie.type}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
