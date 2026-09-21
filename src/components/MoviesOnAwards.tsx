"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Bookmark, Star, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export interface AwardMovie {
  id: string;
  tag: string;
  title: string;
  rating: string;
  duration: string;
  year: string;
  genres: string[];
  certificate: string;
  description: string;
  backdrop: string;
}

interface MoviesOnAwardsProps {
  onDataStatus?: (hasData: boolean) => void;
}

export default function MoviesOnAwards({ onDataStatus }: MoviesOnAwardsProps) {
  const router = useRouter();
  const [items, setItems] = useState<AwardMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const fetchAwardMovies = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch("/api/movies/awards");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const list: AwardMovie[] = data.items || [];
      setItems(list);
      setCurrentIndex(0);
      onDataStatus?.(list.length > 0);
    } catch (err) {
      console.error("Failed to load movies on awards:", err);
      setIsError(true);
      onDataStatus?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAwardMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    if (items.length <= 1) return;
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    if (items.length <= 1) return;
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const toggleFavorite = (item: AwardMovie) => {
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

  const navigateToMovie = (id: string) => {
    router.push(`/movies/${id}`);
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-between overflow-hidden animate-pulse">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="h-8 w-48 bg-zinc-800/80 rounded-md" />
          <div className="flex items-center gap-2">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-zinc-800/60" />
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-zinc-800/60" />
          </div>
        </div>
        <div className="flex flex-col flex-1 space-y-3.5 sm:space-y-4">
          <div className="w-full aspect-[16/9.5] rounded-xl sm:rounded-2xl bg-zinc-800/60" />
          <div className="h-6 w-28 bg-zinc-800/80 rounded-lg" />
          <div className="h-7 w-3/4 bg-zinc-800/80 rounded-md" />
          <div className="h-4 w-1/2 bg-zinc-800/50 rounded-md" />
          <div className="h-12 w-full bg-zinc-800/40 rounded-md" />
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-28 bg-zinc-800/70 rounded-xl" />
            <div className="h-10 w-32 bg-zinc-800/60 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Hide component if error or no items found
  if (isError || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex] || items[0];

  return (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      {/* Header with Title & Navigation Arrows */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide font-custom2">
          Movies on Awards
        </h2>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={items.length <= 1}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1c202a] hover:bg-[#2a303d] disabled:opacity-40 disabled:hover:bg-[#1c202a] text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Previous movie on awards"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={items.length <= 1}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1c202a] hover:bg-[#2a303d] disabled:opacity-40 disabled:hover:bg-[#1c202a] text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Next movie on awards"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Award Content with Slide Animation */}
      <div
        key={`${currentItem.id}-${direction}`}
        className={`flex flex-col flex-1 space-y-3.5 sm:space-y-4 ${
          direction === "right" ? "animate-slide-right" : "animate-slide-left"
        }`}
      >
        {/* Landscape Image Banner */}
        <div
          onClick={() => navigateToMovie(currentItem.id)}
          className="relative w-full aspect-[16/9.5] rounded-xl sm:rounded-2xl overflow-hidden bg-[#12151c] shadow-lg cursor-pointer group"
        >
          {currentItem.backdrop ? (
            <Image
              key={currentItem.id}
              src={currentItem.backdrop}
              alt={currentItem.title}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs">
              No Backdrop Available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Tag Badge */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#1f2430] text-zinc-300 text-xs font-semibold tracking-wide border border-white/10">
            {currentItem.tag}
          </span>
        </div>

        {/* Title */}
        <h3
          key={`title-${currentItem.id}`}
          onClick={() => navigateToMovie(currentItem.id)}
          className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight line-clamp-1 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          {currentItem.title}
        </h3>

        {/* Metadata Details Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-zinc-300">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{currentItem.rating}</span>
          </div>

          {currentItem.duration && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">{currentItem.duration}</span>
            </>
          )}

          {currentItem.year && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">{currentItem.year}</span>
            </>
          )}

          {currentItem.genres && currentItem.genres.length > 0 && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">
                {currentItem.genres[0]}
                {currentItem.genres.length > 1
                  ? ` +${currentItem.genres.length - 1}`
                  : ""}
              </span>
            </>
          )}

          {currentItem.certificate && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">{currentItem.certificate}</span>
            </>
          )}
        </div>

        {/* Description Paragraph */}
        <p
          key={`desc-${currentItem.id}`}
          className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-3"
        >
          {currentItem.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Watch Now Button */}
          <button
            type="button"
            onClick={() => navigateToMovie(currentItem.id)}
            className="font-custom1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-[#2ca566] hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-white text-white" />
            <span>Watch Now</span>
          </button>

          {/* Add Watchlist Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(currentItem)}
            className="font-custom1 inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-white text-xs sm:text-sm font-semibold tracking-wide border border-white/10 transition-all duration-200 cursor-pointer group/fav"
          >
            {favorites[currentItem.id] ? (
              <>
                <Bookmark className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-400 fill-yellow-400 stroke-yellow-400 transition-transform duration-300 scale-110 shrink-0" />
                <span>Added to Watchlist</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.2] text-white transition-all duration-200 group-hover/fav:text-yellow-400 group-hover/fav:scale-110 shrink-0" />
                <span>Add Watchlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
