"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft, Clapperboard } from "lucide-react";
import { PopularContent } from "@/domain/movie/movie.types";

export type { PopularContent };

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

export default function PopularOfWeek() {
  const [items, setItems] = useState<PopularContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const itemsPerPage = 4;

  useEffect(() => {
    let isMounted = true;

    async function fetchPopular() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/popular");
        if (!res.ok) {
          throw new Error(`Failed to fetch popular content: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch (err) {
        console.error("Error fetching popular content:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPopular();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  if (!isLoading && items.length === 0) {
    return null;
  }

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
          {isLoading && items.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 px-1">
              {Array.from({ length: itemsPerPage }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-2 sm:p-2.5 rounded-2xl bg-[#12151c]/60 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 mr-3 shrink-0" />
                  <div className="w-[76px] sm:w-[86px] aspect-[2/3] rounded-2xl bg-white/10 shrink-0" />
                  <div className="ml-3 flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-white/10 rounded" />
                    <div className="w-1/2 h-3 bg-white/10 rounded" />
                    <div className="w-1/3 h-3 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 px-1"
                >
                  {items
                    .slice(
                      pageIndex * itemsPerPage,
                      (pageIndex + 1) * itemsPerPage
                    )
                    .map((item) => {
                      const firstGenre = item.genres[0];
                      const remainingGenres = Math.max(item.genres.length - 1, 0);
                      const href =
                        item.type === "Movie"
                          ? `/movies/${item.id}`
                          : `/tv/${item.id}`;

                      return (
                        <Link
                          key={item.id}
                          href={href}
                          className="group flex items-center p-2 sm:p-2.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.05] cursor-pointer select-none"
                        >
                          {/* Rank Number */}
                          <span className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white/95 mr-3 sm:mr-3.5 select-none min-w-[26px] text-center tracking-tight shrink-0">
                            {item.rank}
                          </span>

                          {/* Poster Thumbnail */}
                          <div className="relative w-[76px] sm:w-[86px] aspect-[2/3] rounded-2xl overflow-hidden shrink-0 shadow-lg bg-[#12151c] transition-transform duration-300 group-hover:scale-105">
                            {item.poster ? (
                              <Image
                                src={item.poster}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 76px, 86px"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                                No Poster
                              </div>
                            )}
                          </div>

                          {/* Movie Info Block */}
                          <div className="ml-3 sm:ml-3.5 flex flex-col justify-center min-w-0 flex-1 space-y-1">
                            {/* Title */}
                            <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-wide truncate group-hover:text-emerald-400 transition-colors">
                              {item.title}
                            </h3>

                            {/* Genres with '+N' formatting */}
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium truncate">
                              <Clapperboard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              {firstGenre ? (
                                <span className="truncate">
                                  {firstGenre}
                                  {remainingGenres > 0 && ` +${remainingGenres}`}
                                </span>
                              ) : (
                                <span className="text-zinc-500">{item.type}</span>
                              )}
                            </div>

                            {/* Total Vote Count */}
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#222834] text-zinc-300 text-[11px] font-medium">
                                {formatRatingCount(item.vote_count)}
                              </span>
                            </div>

                            {/* Rating & Type */}
                            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium pt-0.5">
                              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{item.rating}</span>
                              </div>
                              <span className="text-zinc-500">•</span>
                              <span className="text-zinc-400">{item.type}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
