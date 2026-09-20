"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";

export interface JustReleaseMovie {
  id: string;
  title: string;
  rating: string;
  genre: string;
  type: string;
  poster: string;
  href?: string;
}

const justReleaseMovies: JustReleaseMovie[] = [
  {
    id: "1",
    title: "Enola Holmes 2",
    rating: "4.8",
    genre: "Action",
    type: "Movie",
    poster: "https://image.tmdb.org/t/p/w500/tegBpjM5ODoYoM1NjaiHVLEA0QM.jpg",
    href: "/watch/enola-holmes-2",
  },
  {
    id: "2",
    title: "Satan's slaves",
    rating: "4.6",
    genre: "Horror",
    type: "Movie",
    poster: "https://image.tmdb.org/t/p/w500/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg",
    href: "/watch/satans-slaves",
  },
  {
    id: "3",
    title: "The Flash",
    rating: "4.6",
    genre: "Mystery",
    type: "Movie",
    poster: "https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
    href: "/watch/the-flash",
  },
  {
    id: "4",
    title: "Weak Hero",
    rating: "4.6",
    genre: "Season 1",
    type: "Drama",
    poster: "https://image.tmdb.org/t/p/w500/xRw3akJQdfgqx0x4fiHW7nIkEUJ.jpg",
    href: "/watch/weak-hero",
  },
  {
    id: "5",
    title: "Wonder Woman",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    poster: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
    href: "/watch/wonder-woman",
  },
  {
    id: "6",
    title: "John Wick: Chapter 4",
    rating: "4.9",
    genre: "Action",
    type: "Movie",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    href: "/watch/john-wick-4",
  },
  {
    id: "7",
    title: "Avatar: The Way of Water",
    rating: "4.8",
    genre: "Sci-Fi",
    type: "Movie",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    href: "/watch/avatar-2",
  },
];

export default function JustRelease() {
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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
          Just Releases
        </h2>
        <Link
          href="/discover"
          className="font-custom1 inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-sm font-medium text-zinc-300 bg-[#1c202a] hover:bg-[#282e3c] hover:text-white border border-white/10 shadow-sm transition-all duration-200 active:scale-95"
        >
          See all
        </Link>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Dark Shadow Fade (Hiện đẹp trên Laptop/PC và ẩn trên Mobile) */}
        {canScrollLeft && (
          <div className="hidden md:block pointer-events-none absolute left-0 top-0 bottom-0 w-24 lg:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Left Scroll Arrow (Ẩn khi ở item đầu tiên) */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-1.5 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Right Dark Shadow Fade Overlay (Hiện trên cả Mobile và Laptop/PC) */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 lg:w-48 bg-gradient-to-l from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Right Scroll Arrow (Đặt nổi bật trên nền bóng tối) */}
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
          {justReleaseMovies.map((movie) => (
            <Link
              key={movie.id}
              href={movie.href || "#"}
              className="group relative shrink-0 w-[200px] sm:w-[230px] md:w-[250px] aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151c] shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_25px_rgba(0,0,0,0.8)] snap-start select-none cursor-pointer"
            >
              {/* Poster Image */}
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 200px, (max-width: 768px) 230px, 250px"
              />

              {/* Bottom Gradient Overlay (Chỉ phủ nửa dưới của card) */}
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
                  <span>{movie.genre}</span>
                  <span className="text-zinc-500">•</span>
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
