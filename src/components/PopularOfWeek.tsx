"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft, Clapperboard } from "lucide-react";

export interface PopularMovie {
  id: string;
  rank: number;
  title: string;
  poster: string;
  genres: string[];
  userRatings: number;
  rating: string;
  type: string;
  href?: string;
}

export function formatRatingCount(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

const popularMovies: PopularMovie[] = [
  {
    id: "1",
    rank: 1,
    title: "The Last Of Us",
    poster: "https://image.tmdb.org/t/p/w500/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    genres: ["Horror", "Thriller", "Action"],
    userRatings: 14250000,
    rating: "4.3",
    type: "Season 2",
    href: "/watch/the-last-of-us",
  },
  {
    id: "2",
    rank: 2,
    title: "Sri Asih",
    poster: "https://image.tmdb.org/t/p/w500/b8c61WQx9RVF9hDk8Pq63kinbHu.jpg",
    genres: ["Superhero", "Action", "Adventure"],
    userRatings: 28400,
    rating: "4.9",
    type: "Movie",
    href: "/watch/sri-asih",
  },
  {
    id: "3",
    rank: 3,
    title: "The Flash",
    poster: "https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
    genres: ["Comedy", "Action"],
    userRatings: 89200,
    rating: "3.7",
    type: "Movie",
    href: "/watch/the-flash",
  },
  {
    id: "4",
    rank: 4,
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    genres: ["Biography", "Drama", "History"],
    userRatings: 345800,
    rating: "4.9",
    type: "Movie",
    href: "/watch/oppenheimer",
  },
  {
    id: "5",
    rank: 5,
    title: "Spider-Man: Across Spider-Verse",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    genres: ["Animation", "Action", "Sci-Fi"],
    userRatings: 280600,
    rating: "4.9",
    type: "Movie",
    href: "/watch/spider-man-spider-verse",
  },
  {
    id: "6",
    rank: 6,
    title: "Dune: Part Two",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    genres: ["Sci-Fi", "Adventure"],
    userRatings: 310200,
    rating: "4.9",
    type: "Movie",
    href: "/watch/dune-2",
  },
  {
    id: "7",
    rank: 7,
    title: "John Wick: Chapter 4",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    genres: ["Action", "Thriller", "Crime"],
    userRatings: 215400,
    rating: "4.8",
    type: "Movie",
    href: "/watch/john-wick-4",
  },
  {
    id: "8",
    rank: 8,
    title: "Avatar: The Way of Water",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    genres: ["Sci-Fi", "Adventure", "Action"],
    userRatings: 410900,
    rating: "4.7",
    type: "Movie",
    href: "/watch/avatar-2",
  },
  {
    id: "9",
    rank: 9,
    title: "Guardians of the Galaxy 3",
    poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    genres: ["Action", "Sci-Fi", "Comedy"],
    userRatings: 198300,
    rating: "4.8",
    type: "Movie",
    href: "/watch/gotg-3",
  },
  {
    id: "10",
    rank: 10,
    title: "Weak Hero Class 1",
    poster: "https://image.tmdb.org/t/p/w500/xRw3akJQdfgqx0x4fiHW7nIkEUJ.jpg",
    genres: ["Action", "Drama"],
    userRatings: 64200,
    rating: "4.9",
    type: "Season 1",
    href: "/watch/weak-hero",
  },
  {
    id: "11",
    rank: 11,
    title: "Fast X",
    poster: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
    genres: ["Action", "Crime", "Thriller"],
    userRatings: 94100,
    rating: "4.2",
    type: "Movie",
    href: "/watch/fast-x",
  },
  {
    id: "12",
    rank: 12,
    title: "Barbie",
    poster: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    genres: ["Comedy", "Adventure", "Fantasy"],
    userRatings: 320500,
    rating: "4.5",
    type: "Movie",
    href: "/watch/barbie",
  },
];

export default function PopularOfWeek() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(popularMovies.length / itemsPerPage);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
          Popular of the week
        </h2>
      </div>

      {/* Paginated 4-Cards Grid Carousel */}
      <div className="relative group/popular">
        {/* Left Navigation Arrow */}
        {currentPage > 0 && (
          <button
            onClick={handlePrev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Navigation Arrow */}
        {currentPage < totalPages - 1 && (
          <button
            onClick={handleNext}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Carousel Viewport Container */}
        <div className="overflow-hidden w-full rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div
                key={pageIndex}
                className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 px-1"
              >
                {popularMovies
                  .slice(
                    pageIndex * itemsPerPage,
                    (pageIndex + 1) * itemsPerPage
                  )
                  .map((movie) => (
                    <Link
                      key={movie.id}
                      href={movie.href || "#"}
                      className="group flex items-center p-2 sm:p-2.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.05] cursor-pointer select-none"
                    >
                      {/* Rank Number */}
                      <span className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white/95 mr-3 sm:mr-3.5 select-none min-w-[26px] text-center tracking-tight shrink-0">
                        {movie.rank}
                      </span>

                      {/* Poster Thumbnail */}
                      <div className="relative w-[76px] sm:w-[86px] aspect-[2/3] rounded-2xl overflow-hidden shrink-0 shadow-lg bg-[#12151c] transition-transform duration-300 group-hover:scale-105">
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 76px, 86px"
                        />
                      </div>

                      {/* Movie Info Block */}
                      <div className="ml-3 sm:ml-3.5 flex flex-col justify-center min-w-0 flex-1 space-y-1">
                        {/* Title */}
                        <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-wide truncate group-hover:text-emerald-400 transition-colors">
                          {movie.title}
                        </h3>

                        {/* Genres */}
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium truncate">
                          <Clapperboard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">
                            {movie.genres.join(" • ")}
                          </span>
                        </div>

                        {/* Total User Rating */}
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#222834] text-zinc-300 text-[11px] font-medium">
                            {formatRatingCount(movie.userRatings)}
                          </span>
                        </div>

                        {/* Rating & Type */}
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium pt-0.5">
                          <div className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{movie.rating}</span>
                          </div>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400">{movie.type}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
