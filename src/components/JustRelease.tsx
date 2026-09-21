"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";
import { JustReleaseMovie } from "@/domain/movie/movie.types";

export type { JustReleaseMovie };

export default function JustRelease() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [movies, setMovies] = useState<JustReleaseMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchJustReleasedMovies() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/movies/just-releases");
        if (!res.ok) {
          throw new Error(`Failed to fetch just released movies: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.movies && Array.isArray(data.movies)) {
          setMovies(data.movies);
        }
      } catch (err) {
        console.error("Error fetching just released movies:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchJustReleasedMovies();

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

  if (!isLoading && movies.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
          Just Releases
        </h2>
        <Link
          href="/discover?tab=all&country=all&genre=all&sort=new-releases#browse-section"
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
            onClick={() => handleScroll("left")}
            className="absolute left-1.5 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Right Dark Shadow Fade Overlay */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 lg:w-48 bg-gradient-to-l from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
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
          className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading && movies.length === 0
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-[200px] sm:w-[230px] md:w-[250px] aspect-[2/3] rounded-2xl bg-[#12151c] animate-pulse relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                    <div className="w-3/4 h-5 bg-white/10 rounded-md" />
                    <div className="w-1/2 h-3.5 bg-white/10 rounded-md" />
                  </div>
                </div>
              ))
            : movies.map((movie) => {
                const displayGenre =
                  movie.genres.length > 0
                    ? `${movie.genres[0]}${
                        movie.genres.length > 1 ? ` +${movie.genres.length - 1}` : ""
                      }`
                    : movie.type || "Movie";

                const detailHref =
                  movie.type === "TV Series" ? `/tv/${movie.id}` : `/movies/${movie.id}`;

                return (
                  <Link
                    key={`${movie.type}-${movie.id}`}
                    href={detailHref}
                    className="group relative shrink-0 w-[200px] sm:w-[230px] md:w-[250px] aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151c] shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_25px_rgba(0,0,0,0.8)] snap-start select-none cursor-pointer"
                  >
                    {/* Poster Image */}
                    {movie.poster ? (
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 200px, (max-width: 768px) 230px, 250px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-500 text-xs">
                        No Poster
                      </div>
                    )}

                    {/* Bottom Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

                    {/* Movie Info at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end space-y-1.5 z-10">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-wide truncate drop-shadow-md group-hover:text-emerald-400 transition-colors">
                        {movie.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{movie.rating}</span>
                        </div>
                        <span className="text-zinc-500">•</span>
                        <span className="truncate max-w-[90px]">{displayGenre}</span>
                        <span className="text-zinc-500">•</span>
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
