"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Star } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useWatchlist } from "@/features/watchlist/hooks/useWatchlist";
import { WatchlistItemDto } from "@/features/watchlist/watchlist.type";

// ─── Helpers ───

function getMediaImageUrl(
  posterPath?: string | null,
  backdropPath?: string | null
): string {
  const resolve = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `https://image.tmdb.org/t/p/w780${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (backdropPath && backdropPath.trim()) return resolve(backdropPath);
  if (posterPath && posterPath.trim()) return resolve(posterPath);

  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80";
}

// ─── Watchlist Card Component ───

function WatchlistCard({
  item,
}: {
  item: WatchlistItemDto;
}) {
  const { content, type } = item;
  const detailHref =
    type === "movie" ? `/movie/${content.tmdb_id}` : `/tv/${content.tmdb_id}`;

  const imageUrl = getMediaImageUrl(content.poster_path, content.backdrop_path);

  const primaryGenre =
    content.genres && content.genres.length > 0
      ? content.genres[0]
      : type === "tv"
      ? "Drama"
      : "Movie";
  const remainingGenres =
    content.genres && content.genres.length > 1
      ? content.genres.length - 1
      : 0;

  return (
    <Link
      href={detailHref}
      className="group relative shrink-0 w-[80%] sm:w-[calc((100%-16px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-60px)/4)] aspect-video rounded-2xl overflow-hidden bg-[#12151d] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/80 snap-start select-none cursor-pointer block"
      aria-label={`View details for ${content.title}`}
    >
      {/* Background Poster / Backdrop Image */}
      <Image
        src={imageUrl}
        alt={content.title || "Media Poster"}
        fill
        sizes="(max-width: 640px) 80vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Dark Gradient Overlay at Bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-35% to-transparent pointer-events-none" />

      {/* Bottom Content Metadata */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-10 space-y-1 pb-3 sm:pb-3.5">
        {/* Title */}
        <h3 className="font-bold text-white text-xs sm:text-sm md:text-base truncate drop-shadow group-hover:text-emerald-400 transition-colors">
          {content.title}
        </h3>

        {/* Metadata Row: Rating • Genre +n • Type */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 drop-shadow truncate">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">
            {content.vote_average > 0
              ? content.vote_average.toFixed(1)
              : "0.0"}
          </span>
          <span className="text-zinc-500">•</span>
          <span className="truncate max-w-[85px]">
            {primaryGenre}
            {remainingGenres > 0 && ` +${remainingGenres}`}
          </span>
          <span className="text-zinc-500">•</span>
          <span className="truncate">
            {type === "tv"
              ? content.season
                ? content.season.endsWith("S")
                  ? content.season
                  : `${content.season}S`
                : "Series"
              : "Movie"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Your Watchlist Section Component ───

export default function WatchlistSection() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const userId = useAuthStore((s) => s.user_id);
  const { items, isLoading, fetchWatchlist } = useWatchlist();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Fetch watchlist when user is authenticated
  useEffect(() => {
    if (hasHydrated && userId) {
      fetchWatchlist();
    }
  }, [hasHydrated, userId, fetchWatchlist]);

  // Check scroll position to dynamically toggle buttons and shadows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [items]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount =
        direction === "left" ? -containerWidth : containerWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 350);
    }
  };

  // Only appear for authenticated users; unauthenticated will be hidden
  if (!hasHydrated || !userId) {
    return null;
  }

  // Hide section completely if not loading and there are no watchlist items
  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative overflow-hidden watchlist-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
          Your Watchlist
        </h2>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Shadow Fade — PC only; hidden on mobile */}
        {canScrollLeft && (
          <div className="hidden sm:block pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-28 lg:w-36 bg-gradient-to-r from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Left Scroll Arrow — PC only; hidden at start, hidden on mobile */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className="hidden sm:flex absolute left-1.5 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Right Shadow Fade — PC only; hidden on mobile */}
        {canScrollRight && (
          <div className="hidden sm:block pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 lg:w-48 bg-gradient-to-l from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Right Scroll Arrow — PC only; hidden on mobile */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll("right")}
            className="hidden sm:flex absolute right-1.5 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Next"
          >
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Cards Horizontal Scroll List */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory px-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            touchAction: "pan-x",
          }}
        >
          {isLoading && items.length === 0
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-[80%] sm:w-[calc((100%-16px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-60px)/4)] aspect-video rounded-2xl bg-[#12151c] animate-pulse relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                    <div className="w-3/4 h-5 bg-white/10 rounded-md" />
                    <div className="w-1/2 h-3.5 bg-white/10 rounded-md" />
                  </div>
                </div>
              ))
            : items.map((item) => (
                <WatchlistCard
                  key={item.watchlist_id}
                  item={item}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
