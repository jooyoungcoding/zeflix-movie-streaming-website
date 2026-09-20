"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";

export interface SeriesItem {
  id: string;
  title: string;
  rating: string;
  genre: string;
  type: string;
  backdrop: string;
  href?: string;
}

export const seriesList: SeriesItem[] = [
  {
    id: "1",
    title: "Wednesday Season 1",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    href: "/watch/wednesday",
  },
  {
    id: "2",
    title: "Beef Series",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/bKxiLRP0Qm2JwLs09vSbg094Xzc.jpg",
    href: "/watch/beef",
  },
  {
    id: "3",
    title: "Valhalla Muders Series",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/r0mda2RjVf2D6Z4YqGq3XgK7d6j.jpg",
    href: "/watch/valhalla-murders",
  },
  {
    id: "4",
    title: "The Witcher Volume 2",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    href: "/watch/the-witcher",
  },
  {
    id: "5",
    title: "The Foreigner Series",
    rating: "4.6",
    genre: "Action",
    type: "Movie",
    backdrop: "https://image.tmdb.org/t/p/w500/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    href: "/watch/the-foreigner",
  },
  {
    id: "6",
    title: "The Last Of Us",
    rating: "4.8",
    genre: "Drama",
    type: "Series",
    backdrop: "https://image.tmdb.org/t/p/w500/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    href: "/watch/the-last-of-us",
  },
  {
    id: "7",
    title: "Stranger Things 4",
    rating: "4.9",
    genre: "Sci-Fi",
    type: "Series",
    backdrop: "https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    href: "/watch/stranger-things",
  },
];

export default function SeriesSection() {
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
          TV Series
        </h2>
        <Link
          href="/series"
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

        {/* Series Cards Horizontal Scroll List */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 scroll-smooth snap-x px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {seriesList.map((series) => (
            <Link
              key={series.id}
              href={series.href || "#"}
              className="group shrink-0 w-[230px] sm:w-[260px] md:w-[280px] select-none cursor-pointer snap-start"
            >
              {/* Landscape Thumbnail Box */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#12151c] shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                <Image
                  src={series.backdrop}
                  alt={series.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 230px, (max-width: 768px) 260px, 280px"
                />
              </div>

              {/* Title & Metadata Below Thumbnail */}
              <div className="mt-3 flex flex-col space-y-1">
                <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-wide truncate group-hover:text-emerald-400 transition-colors">
                  {series.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{series.rating}</span>
                  </div>
                  <span className="text-zinc-600">•</span>
                  <span>{series.genre}</span>
                  <span className="text-zinc-600">•</span>
                  <span>{series.type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
