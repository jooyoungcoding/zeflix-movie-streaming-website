"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SimilarContentItem } from "@/domain/movie/movie.types";

interface SimilarContentSectionProps {
  contentId: string;
  type: "Movie" | "TV Series";
}

export default function SimilarContentSection({
  contentId,
  type,
}: SimilarContentSectionProps) {
  const router = useRouter();
  const [items, setItems] = useState<SimilarContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [maxIndex, setMaxIndex] = useState<number>(0);

  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  // Card dimensions in px
  const itemWidth = 270;
  const gap = 20;
  const itemStep = itemWidth + gap;

  useEffect(() => {
    let isMounted = true;
    async function fetchSimilar() {
      setIsLoading(true);
      try {
        const endpoint =
          type === "Movie"
            ? `/api/movies/${contentId}/similar`
            : `/api/tv/${contentId}/similar`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch similar content");
        const data = await res.json();
        if (isMounted && data.items && Array.isArray(data.items)) {
          setItems(data.items.slice(0, 12));
        }
      } catch (err) {
        console.error("Error fetching similar content:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (contentId) {
      fetchSimilar();
    }

    return () => {
      isMounted = false;
    };
  }, [contentId, type]);

  useEffect(() => {
    const updateMaxIndex = () => {
      const desktop = window.innerWidth >= 640;
      setIsDesktop(desktop);
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const visibleCount = Math.floor(containerWidth / itemStep);
        const max = Math.max(0, items.length - Math.max(1, visibleCount));
        setMaxIndex(max);
        setCurrentIndex((prev) => Math.min(prev, max));
      }
    };

    updateMaxIndex();
    window.addEventListener("resize", updateMaxIndex);
    return () => window.removeEventListener("resize", updateMaxIndex);
  }, [items.length, itemStep]);

  if (!isLoading && items.length === 0) {
    return null;
  }

  const titleText =
    type === "Movie" ? "Similar Movies For You" : "Similar TV Series For You";

  const seeAllHref =
    type === "Movie"
      ? "/discover?tab=movies&country=all&genre=all&sort=all#browse-section"
      : "/discover?tab=tv&country=all&genre=all&sort=all#browse-section";

  const handleCardClick = (item: SimilarContentItem) => {
    if (item.type === "Movie") {
      router.push(`/movies/${item.id}`);
    } else {
      router.push(`/tv/${item.id}`);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 2));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 2));
  };

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  return (
    <div className="w-full space-y-4 my-8 sm:my-12">
      {/* Header Row: Title on Left, See All on Right */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-custom2">
          {titleText}
        </h3>

        <Link
          href={seeAllHref}
          className="font-custom1 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1f242d] hover:bg-[#2a303d] border border-white/10 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          See all
        </Link>
      </div>

      {/* Slider Viewport with Arrow Buttons and Edge Shadow Fades */}
      <div className="relative w-full flex items-center">
        {/* Left Dark Shadow Fade (Hidden on mobile) */}
        {canPrev && (
          <div className="hidden sm:block pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-black via-black/80 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Left Arrow Button (Hidden on mobile) */}
        {canPrev && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute left-2 top-1/3 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c202a]/95 hover:bg-black text-white items-center justify-center transition-all duration-200 border border-white/15 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Previous similar content"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Overflow Track Window: scroll-x on mobile, slider on desktop */}
        <div
          ref={containerRef}
          className="w-full overflow-x-auto sm:overflow-hidden scrollbar-hide py-1 touch-pan-x"
        >
          {isLoading ? (
            <div className="flex gap-5 py-2 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="shrink-0 space-y-3"
                  style={{ width: `${itemWidth}px` }}
                >
                  <div className="w-full aspect-[16/9.5] bg-zinc-800/60 rounded-2xl" />
                  <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                  <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex items-start sm:transition-transform sm:duration-500 sm:ease-out"
              style={{
                transform: isDesktop ? `translateX(-${currentIndex * itemStep}px)` : "none",
                gap: `${gap}px`,
              }}
            >
              {items.map((item) => {
                const firstGenre =
                  item.genres && item.genres.length > 0 ? item.genres[0] : null;
                const remainingGenres = Math.max((item.genres?.length || 0) - 1, 0);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className="group/card shrink-0 select-none cursor-pointer flex flex-col"
                    style={{ width: `${itemWidth}px` }}
                  >
                    {/* Landscape Thumbnail Box (No border, rounded-2xl) */}
                    <div className="relative w-full aspect-[16/9.5] rounded-2xl overflow-hidden bg-[#12151c] shadow-md transition-all duration-300 group-hover/card:scale-[1.03]">
                      {item.backdrop ? (
                        <Image
                          src={item.backdrop}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                          sizes="(max-width: 640px) 240px, 270px"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs text-zinc-600">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Title & Metadata BELOW thumbnail (separated from image) */}
                    <div className="mt-3 flex flex-col space-y-1">
                      <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-wide truncate group-hover/card:text-emerald-400 transition-colors">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        {item.rating && (
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{item.rating}</span>
                          </div>
                        )}

                        {item.year && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span>{item.year}</span>
                          </>
                        )}

                        {firstGenre && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="text-emerald-400 font-medium">
                              {firstGenre}
                              {remainingGenres > 0 && ` +${remainingGenres}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Dark Shadow Fade (Hidden on mobile) */}
        {canNext && (
          <div className="hidden sm:block pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-l from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Right Arrow Button (Hidden on mobile) */}
        {canNext && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden sm:flex absolute right-2 top-1/3 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c202a]/95 hover:bg-black text-white items-center justify-center transition-all duration-200 border border-white/15 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Next similar content"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
