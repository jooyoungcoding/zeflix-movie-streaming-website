"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Bookmark,
  Star,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { FeaturedContent } from "@/domain/movie/movie.types";

export type { FeaturedContent };

export default function FeaturedInZeflix() {
  const [items, setItems] = useState<FeaturedContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    async function fetchFeatured() {
      try {
        setIsLoading(true);
        setHasError(false);
        const res = await fetch("/api/featured");
        if (!res.ok) {
          throw new Error(`Failed to fetch featured content: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch (err) {
        console.error("Error fetching featured content:", err);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNext = () => {
    if (items.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    if (items.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const toggleFavorite = (item: FeaturedContent) => {
    const isAdded = !!favorites[item.id];
    setFavorites((prev) => ({
      ...prev,
      [item.id]: !isAdded,
    }));

    if (!isAdded) {
      toast.success(`Added "${item.title}" to Watchlist!`, {
        id: `watchlist-${item.id}`,
        icon: "🔖",
        duration: 2500,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    } else {
      toast(`Removed "${item.title}" from Watchlist`, {
        id: `watchlist-${item.id}`,
        icon: "🗑️",
        duration: 2000,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    }
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <section className="w-full relative min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] overflow-hidden border-none my-4 sm:my-8 flex flex-col justify-between animate-pulse">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-14 flex flex-col flex-1 justify-between">
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="h-8 w-60 bg-zinc-800/80 rounded-md mb-2" />
            <div className="h-4 w-44 bg-zinc-800/60 rounded-md" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
            <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col space-y-4">
              <div className="h-6 w-32 bg-zinc-800/80 rounded-full" />
              <div className="h-10 w-3/4 bg-zinc-800/80 rounded-lg" />
              <div className="h-5 w-1/2 bg-zinc-800/60 rounded-md" />
              <div className="h-16 w-full max-w-2xl bg-zinc-800/40 rounded-lg" />
              <div className="flex gap-4 pt-2">
                <div className="h-12 w-36 bg-zinc-800/80 rounded-xl" />
                <div className="h-12 w-36 bg-zinc-800/60 rounded-xl" />
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5 flex gap-3 overflow-hidden">
              <div className="w-[145px] sm:w-[185px] lg:w-[208px] aspect-[2/3] bg-zinc-800/80 rounded-2xl shrink-0" />
              <div className="w-[145px] sm:w-[185px] lg:w-[208px] aspect-[2/3] bg-zinc-800/40 rounded-2xl shrink-0" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (hasError) {
    return (
      <section className="w-full relative min-h-[300px] flex items-center justify-center my-4 sm:my-8 px-4">
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#12151c] border border-white/10 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Featured Content</h3>
          <p className="text-sm text-zinc-400">Unable to load featured content.</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (items.length === 0) {
    return null;
  }

  const currentItem = items[activeIndex] || items[0];
  const watchHref =
    currentItem.type === "Movie"
      ? `/movies/${currentItem.id}`
      : `/tv/${currentItem.id}`;

  const firstGenre = currentItem.genres && currentItem.genres.length > 0 ? currentItem.genres[0] : null;
  const remainingGenres = Math.max((currentItem.genres?.length || 0) - 1, 0);

  return (
    <section className="w-full relative min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] overflow-hidden border-none my-4 sm:my-8 flex flex-col justify-between">
      {/* Full-Screen Dynamic Background Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {currentItem.backdrop ? (
          <Image
            key={currentItem.id}
            src={currentItem.backdrop}
            alt={currentItem.title}
            fill
            priority
            className="object-cover object-center scale-105 animate-fade-in transition-all duration-700 brightness-[0.55]"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-[#0d1017]" />
        )}
        {/* Top Edge Seamless Fade to Solid Black */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-black via-black/50 to-transparent" />
        {/* Left Side Shadow for Text Readability (reduced shadow) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent lg:w-[62%]" />
        {/* Bottom Edge Fade to Black */}
        <div className="absolute bottom-0 inset-x-0 h-36 sm:h-44 bg-gradient-to-t from-black via-black/80 to-transparent" />
        {/* Subtle Emerald Cinematic Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />
      </div>

      {/* Content Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-14 flex flex-col flex-1 justify-between">
        {/* Top Section Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
            Featured in Zeflix
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-custom2 mt-1 font-medium tracking-wide">
            Best featured for you today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Item Info (Appears Below Carousel on Mobile/Tablet via order-2) */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start space-y-3.5 sm:space-y-4 lg:space-y-5">
            {/* Tag Badge */}
            {currentItem.tag && (
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-xs font-semibold tracking-wide">
                <span>{currentItem.tag}</span>
              </div>
            )}

            {/* Title */}
            <h3
              key={`title-${currentItem.id}`}
              className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight animate-hero-title"
            >
              {currentItem.title}
            </h3>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium text-zinc-300">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{currentItem.rating}</span>
              </div>

              {/* Type: Movie or TV Series */}
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300">{currentItem.type}</span>

              {/* Duration if available */}
              {currentItem.duration && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span>{currentItem.duration}</span>
                </>
              )}

              {/* Year if available */}
              {currentItem.year && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span>{currentItem.year}</span>
                </>
              )}

              {/* Genres with UI "+N" formatting */}
              {firstGenre && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span className="text-emerald-400 font-medium">
                    {firstGenre}
                    {remainingGenres > 0 && ` +${remainingGenres}`}
                  </span>
                </>
              )}

              {/* Certificate badge if available */}
              {currentItem.certificate && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[11px] font-semibold">
                    {currentItem.certificate}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p
              key={`desc-${currentItem.id}`}
              className="text-zinc-300/90 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-2xl animate-hero-desc"
            >
              {currentItem.description}
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center sm:gap-4 pt-1 sm:pt-2">
              {/* Watch Now Button */}
              <Link
                href={watchHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3 rounded-xl bg-[#2ca566] hover:bg-emerald-500 active:scale-95 text-white font-custom1 text-sm sm:text-base font-bold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Now</span>
              </Link>

              {/* Add Watchlist Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(currentItem)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 sm:px-6 py-3 rounded-xl bg-[#20242e]/90 hover:bg-[#2a303d] active:scale-95 text-white font-custom1 text-sm sm:text-base font-semibold tracking-wide border border-white/10 backdrop-blur-md transition-all duration-200 cursor-pointer truncate group/fav"
              >
                {favorites[currentItem.id] ? (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400 stroke-yellow-400 transition-transform duration-300 scale-110 shrink-0" />
                    <span className="truncate">Added to Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2] text-white transition-all duration-200 group-hover/fav:text-yellow-400 group-hover/fav:scale-110 shrink-0" />
                    <span className="truncate">Add Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Posters Carousel */}
          <div className="order-1 lg:order-2 lg:col-span-5 relative flex items-center justify-start lg:justify-end py-1 w-full overflow-hidden">
            {/* Carousel Viewport with desktop dynamic sliding mask */}
            <div
              className={`relative w-full sm:w-[410px] lg:w-[450px] [--card-w:145px] [--card-gap:12px] sm:[--card-w:185px] sm:[--card-gap:16px] lg:[--card-w:208px] lg:[--card-gap:20px] overflow-hidden py-3 px-1.5 transition-all duration-300 ${
                activeIndex > 0 && activeIndex < items.length - 1
                  ? "lg:[mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_86%,transparent_100%)]"
                  : activeIndex > 0
                    ? "lg:[mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_100%)]"
                    : "lg:[mask-image:linear-gradient(to_right,black_0%,black_86%,transparent_100%)]"
              }`}
            >
              {/* Sliding Track */}
              <div
                className="flex items-center gap-[var(--card-gap)] transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(calc(-${activeIndex} * (var(--card-w) + var(--card-gap))))`,
                }}
              >
                {items.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveIndex(index)}
                      className={`relative w-[var(--card-w)] aspect-[2/3] rounded-2xl overflow-hidden shrink-0 cursor-pointer transition-all duration-500 select-none ${
                        isActive
                          ? "border-2 border-emerald-400 scale-100 z-20 brightness-100 shadow-xl shadow-emerald-950/50"
                          : "border border-white/10 opacity-50 hover:opacity-85 scale-95 z-10 brightness-75 hover:scale-100"
                      }`}
                    >
                      {item.poster ? (
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 145px, (max-width: 1024px) 185px, 208px"
                          priority={index === 0}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#151922] flex items-center justify-center text-xs text-zinc-500">
                          No Poster
                        </div>
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/40 hover:bg-black/10 transition-colors" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Left Edge Dark Shadow Overlay */}
              {activeIndex > 0 && (
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-25 pointer-events-none" />
              )}

              {/* Right Edge Dark Shadow Overlay */}
              {activeIndex < items.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/85 via-black/40 to-transparent z-25 pointer-events-none" />
              )}

              {/* Previous Slide Button */}
              {activeIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
                  aria-label="Previous featured content"
                >
                  <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}

              {/* Next Slide Button */}
              {activeIndex < items.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
                  aria-label="Next featured content"
                >
                  <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
