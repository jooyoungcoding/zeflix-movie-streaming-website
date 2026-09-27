"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Play } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useWatchHistory } from "@/features/watch-history/hooks/useWatchHistory";
import {
  WatchHistoryItemDto,
  WatchHistoryMovieDto,
  WatchHistoryTVDto,
} from "@/features/watch-history/watch-history.type";

// ─── Helpers ───

function getYear(dateStr?: string | null): string {
  if (!dateStr) return "";
  return dateStr.split("-")[0] || "";
}

function formatWatchedTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcPercentage(
  progress: number,
  duration: number | null,
  completed: boolean
): number | null {
  if (completed) return 100;
  if (!duration || duration <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((progress / duration) * 100)));
}

function calcTopBadgePercentage(item: WatchHistoryItemDto): number | null {
  if (item.type === "tv") {
    const tv = item as WatchHistoryTVDto;
    if (tv.completed) return 100;
    if (tv.total_episodes && tv.total_episodes > 0) {
      const epNum = tv.display_episode_number || tv.episode_number || 1;
      return Math.min(100, Math.max(1, Math.round((epNum / tv.total_episodes) * 100)));
    }
  }
  return calcPercentage(item.progress_seconds, item.duration_seconds, item.completed);
}

function calcBottomProgressPercentage(item: WatchHistoryItemDto): number | null {
  if (item.type === "movie" && item.completed) return 100;
  if (item.type === "tv" && (item as WatchHistoryTVDto).episode_completed) return 100;
  if (!item.duration_seconds || item.duration_seconds <= 0) return null;
  return Math.min(
    100,
    Math.max(0, Math.round((item.progress_seconds / item.duration_seconds) * 100))
  );
}

function getMediaImageUrl(item: WatchHistoryItemDto): string {
  const resolve = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `https://image.tmdb.org/t/p/w780${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (item.type === "movie") {
    const movie = item as WatchHistoryMovieDto;
    if (movie.backdrop_path?.trim()) return resolve(movie.backdrop_path);
    if (movie.poster_path?.trim()) return resolve(movie.poster_path);
  } else {
    const tv = item as WatchHistoryTVDto;
    if (tv.episode_still_path?.trim()) return resolve(tv.episode_still_path);
    if (tv.tv_backdrop_path?.trim()) return resolve(tv.tv_backdrop_path);
    if (tv.tv_poster_path?.trim()) return resolve(tv.tv_poster_path);
  }

  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80";
}

function buildContinueUrl(item: WatchHistoryItemDto): string {
  if (item.type === "movie") {
    const start =
      item.progress_seconds > 0 && !item.completed
        ? `?start=${Math.floor(item.progress_seconds)}`
        : "";
    return `/watch/movie/normal/${item.tmdb_id}${start}`;
  }
  const tv = item as WatchHistoryTVDto;
  const s = tv.season_number || 1;
  const ep = tv.episode_number || 1;

  // If the episode is completed and there's a next episode, route to the next episode
  if (tv.episode_completed && !tv.completed && tv.next_season_number && tv.next_episode_number) {
    return `/watch/tv/normal/${tv.tv_tmdb_id}/${tv.next_season_number}/${tv.next_episode_number}`;
  }

  // If user completed the whole series
  if (tv.completed) {
    return `/watch/tv/normal/${tv.tv_tmdb_id}/${s}/${ep}`;
  }

  const start =
    !tv.episode_completed && tv.progress_seconds > 0
      ? `?start=${Math.floor(tv.progress_seconds)}`
      : "";

  return `/watch/tv/normal/${tv.tv_tmdb_id}/${s}/${ep}${start}`;
}

// ─── Landscape Card Component ───

function ContinueWatchingCard({
  item,
}: {
  item: WatchHistoryItemDto;
}) {
  const isMovie = item.type === "movie";
  const movie = isMovie ? (item as WatchHistoryMovieDto) : null;
  const tv = !isMovie ? (item as WatchHistoryTVDto) : null;

  const title = isMovie ? movie!.title : tv!.tv_name;
  const year = isMovie
    ? getYear(movie!.release_date)
    : getYear(tv!.tv_first_air_date);
  const imageUrl = getMediaImageUrl(item);

  const badgePercentage = calcTopBadgePercentage(item);
  const progressBarPercentage = calcBottomProgressPercentage(item);

  const watchedTime = formatWatchedTime(item.progress_seconds);
  const continueUrl = buildContinueUrl(item);

  const epNumber = tv?.display_episode_number || tv?.episode_number;
  const seasonEpLabel = tv
    ? `S${tv.season_number} E${epNumber}`
    : null;

  return (
    <Link
      href={continueUrl}
      className="group relative shrink-0 w-[80%] sm:w-[calc((100%-16px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-60px)/4)] aspect-video rounded-2xl overflow-hidden bg-[#12151d] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/80 snap-start select-none cursor-pointer block"
      aria-label={`Continue watching ${title}`}
    >
      {/* Background Backdrop / Still Image */}
      <Image
        src={imageUrl}
        alt={title || "Media"}
        fill
        sizes="(max-width: 640px) 80vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Progress percentage — top right */}
      {badgePercentage !== null && (
        <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white shadow-md">
          {badgePercentage}%
        </div>
      )}

      {/* Center Play Button Overlay on Hover */}
      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
      </div>

      {/* Dark Gradient Overlay at Bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-35% to-transparent pointer-events-none" />

      {/* Bottom Content Metadata — Positioned directly ABOVE the progress bar */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-10 space-y-1 pb-3 sm:pb-3.5">
        {/* Title */}
        <h3 className="font-bold text-white text-xs sm:text-sm md:text-base truncate drop-shadow group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>

        {/* Metadata Row: Year • Season/Ep / Watched Time */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 drop-shadow truncate">
          {year && <span>{year}</span>}
          {year && <span className="text-zinc-500">•</span>}
          {seasonEpLabel && (
            <>
              <span className="text-emerald-400 font-semibold">{seasonEpLabel}</span>
              <span className="text-zinc-500">•</span>
            </>
          )}
          <span className="font-medium text-zinc-200">{watchedTime}</span>
        </div>
      </div>

      {/* Progress Bar — Located at the very bottom edge of the card */}
      {progressBarPercentage !== null && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 sm:h-1.5 bg-white/20">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressBarPercentage))}%` }}
          />
        </div>
      )}
    </Link>
  );
}

// ─── Main Continue Watching Section Component ───

export default function ContinueWatchingSection() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const userId = useAuthStore((s) => s.user_id);
  const { items, isLoading, fetchHistory } = useWatchHistory();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Fetch watch history when user is authenticated
  useEffect(() => {
    if (hasHydrated && userId) {
      fetchHistory();
    }
  }, [hasHydrated, userId, fetchHistory]);

  // Filter items: only incomplete series/movies with progress > 0 or with completed episodes ready for next episode
  const continueItems = useMemo(() => {
    return items.filter((item) => {
      if (item.completed) return false;
      if (item.type === "tv") {
        const tv = item as WatchHistoryTVDto;
        return tv.progress_seconds > 0 || tv.episode_completed;
      }
      return item.progress_seconds > 0;
    });
  }, [items]);

  // Check scroll position to dynamically toggle buttons and shadows
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
  }, [continueItems]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = direction === "left" ? -containerWidth : containerWidth;
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

  // Hide section completely if not loading and there are no in-progress items
  if (!isLoading && continueItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative overflow-hidden continue-watching-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
          Continue Watching
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
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-x" }}
        >
          {isLoading && continueItems.length === 0
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
            : continueItems.map((item) => (
              <ContinueWatchingCard
                key={item.history_id}
                item={item}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
