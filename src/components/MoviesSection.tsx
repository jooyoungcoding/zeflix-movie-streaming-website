"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";

export interface MovieItem {
  id: string;
  title: string;
  rating: string;
  genre: string;
  type: string;
  backdrop: string;
  href?: string;
}

export const moviesList: MovieItem[] = [
  {
    id: "1",
    title: "Antman & The Wasp Quantu...",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/m8JTwjd0NM2PAYYKDvCuWmuQIP5.jpg",
    href: "/watch/ant-man-quantumania",
  },
  {
    id: "2",
    title: "Air; Courting A Legend",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",
    href: "/watch/air",
  },
  {
    id: "3",
    title: "John Wick; Chapter 4",
    rating: "4.9",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/h8gHn0OzBoaefsYseUByqsmEDMY.jpg",
    href: "/watch/john-wick-4",
  },
  {
    id: "4",
    title: "Mechamato Movie",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/uLtVZrNYT1YvOz0Buw3EsY789GF.jpg",
    href: "/watch/mechamato",
  },
  {
    id: "5",
    title: "Super Mario Bros",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/9n2tJBplPbgR2ca05hO5qX29xuv.jpg",
    href: "/watch/super-mario-bros",
  },
  {
    id: "6",
    title: "Avatar: The Way of Water",
    rating: "4.8",
    genre: "Sci-Fi",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg",
    href: "/watch/avatar-2",
  },
  {
    id: "7",
    title: "Guardians of the Galaxy 3",
    rating: "4.7",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/5YZbUmjbMa3ClvSW1Wj3D6XGolP.jpg",
    href: "/watch/gotg-3",
  },
];

export default function MoviesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

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

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
          Movies
        </h2>
        <Link
          href="/movies"
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
          {moviesList.map((movie) => (
            <Link
              key={movie.id}
              href={movie.href || "#"}
              className="group shrink-0 w-[230px] sm:w-[260px] md:w-[280px] select-none cursor-pointer snap-start"
            >
              {/* Landscape Thumbnail Box */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#12151c] shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                <Image
                  src={movie.backdrop}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 230px, (max-width: 768px) 260px, 280px"
                />
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
                  <span className="text-zinc-600">•</span>
                  <span>{movie.genre}</span>
                  <span className="text-zinc-600">•</span>
                  <span>{movie.type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
