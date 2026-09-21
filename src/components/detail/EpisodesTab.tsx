"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { EpisodeItem, SeasonItem } from "@/domain/movie/movie.types";

interface EpisodesTabProps {
  tvId: string;
  seasons: SeasonItem[];
  initialEpisodes: EpisodeItem[];
  currentSeasonNumber: number;
  activeEpisodeNumber?: number;
  activeSeasonNumber?: number;
}

export default function EpisodesTab({
  tvId,
  seasons,
  initialEpisodes,
  currentSeasonNumber,
  activeEpisodeNumber,
  activeSeasonNumber,
}: EpisodesTabProps) {
  const router = useRouter();
  const [selectedSeason, setSelectedSeason] = useState<number>(
    activeSeasonNumber || currentSeasonNumber
  );
  const [episodes, setEpisodes] = useState<EpisodeItem[]>(initialEpisodes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [maxIndex, setMaxIndex] = useState<number>(0);

  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  // Card dimensions in px
  const itemWidth = 310;
  const gap = 20;
  const itemStep = itemWidth + gap;

  useEffect(() => {
    const updateMaxIndex = () => {
      const desktop = window.innerWidth >= 640;
      setIsDesktop(desktop);
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const visibleCount = Math.floor(containerWidth / itemStep);
        const max = Math.max(0, episodes.length - Math.max(1, visibleCount));
        setMaxIndex(max);
      }
    };

    updateMaxIndex();
    window.addEventListener("resize", updateMaxIndex);
    return () => window.removeEventListener("resize", updateMaxIndex);
  }, [episodes.length, itemStep]);

  // If active episode is provided, automatically shift initial view on desktop towards active item
  useEffect(() => {
    if (
      activeEpisodeNumber &&
      activeSeasonNumber &&
      selectedSeason === activeSeasonNumber
    ) {
      const activeIdx = episodes.findIndex(
        (e) => e.episodeNumber === activeEpisodeNumber
      );
      if (activeIdx > 0) {
        setCurrentIndex((prev) => (prev === 0 ? Math.min(activeIdx, maxIndex) : prev));
      }
    }
  }, [activeEpisodeNumber, activeSeasonNumber, selectedSeason, episodes, maxIndex]);

  const handleSelectSeason = async (seasonNum: number) => {
    if (seasonNum === selectedSeason) {
      setIsDropdownOpen(false);
      return;
    }

    setSelectedSeason(seasonNum);
    setIsDropdownOpen(false);
    setIsLoading(true);
    setCurrentIndex(0);

    try {
      const res = await fetch(`/api/tv/${tvId}/season/${seasonNum}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch season episodes: ${res.status}`);
      }
      const data = await res.json();
      if (data.episodes && Array.isArray(data.episodes)) {
        setEpisodes(data.episodes);
      }
    } catch (err) {
      console.error("Error loading season episodes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchEpisode = (ep: EpisodeItem) => {
    // Navigate using the actual TMDB season_number and episode_number
    router.push(`/watch/tv/${tvId}/${ep.seasonNumber}/${ep.episodeNumber}`);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 2));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 2));
  };

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  // Compute episode display range e.g. "1-9 episodes"
  const episodeRangeText =
    episodes.length > 0
      ? `${episodes[0].displayEpisodeNumber}-${
          episodes[episodes.length - 1].displayEpisodeNumber
        } episodes`
      : "Episodes";

  const currentSeasonObj =
    seasons.find((s) => s.seasonNumber === selectedSeason) || seasons[0];

  return (
    <div className="w-full space-y-5">
      {/* Header Row: Episode Range on Left, Season Selector Dropdown on Right */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-custom2">
          {episodeRangeText}
        </h3>

        {/* Season Selector Dropdown */}
        {seasons.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c202a] hover:bg-[#252b38] text-white text-xs sm:text-sm font-semibold border border-white/10 transition-all cursor-pointer shadow-lg"
            >
              <span>{currentSeasonObj?.name || `Season ${selectedSeason}`}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#191d26] border border-white/10 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                {seasons.map((s) => (
                  <button
                    key={s.id || s.seasonNumber}
                    type="button"
                    onClick={() => handleSelectSeason(s.seasonNumber)}
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between hover:bg-white/5 ${
                      s.seasonNumber === selectedSeason
                        ? "text-emerald-400 font-bold"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.episodeCount > 0 && (
                      <span className="text-[11px] text-zinc-500">
                        {s.episodeCount} eps
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slider Viewport with Arrow Buttons & Edge Shadow Fades */}
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
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c202a]/95 hover:bg-black text-white items-center justify-center transition-all duration-200 border border-white/15 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Previous episodes"
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
                  className="shrink-0 aspect-[16/9.5] bg-zinc-800/60 rounded-2xl"
                  style={{ width: `${itemWidth}px` }}
                />
              ))}
            </div>
          ) : episodes.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm bg-[#12151c]/40 rounded-2xl">
              No episodes available for this season.
            </div>
          ) : (
            <div
              className="flex items-start sm:transition-transform sm:duration-500 sm:ease-out"
              style={{
                transform: isDesktop ? `translateX(-${currentIndex * itemStep}px)` : "none",
                gap: `${gap}px`,
              }}
            >
              {episodes.map((ep) => {
                const isActive =
                  activeSeasonNumber !== undefined &&
                  activeEpisodeNumber !== undefined &&
                  selectedSeason === activeSeasonNumber &&
                  ep.episodeNumber === activeEpisodeNumber;

                return (
                  <div
                    key={ep.id || ep.displayEpisodeNumber}
                    onClick={() => handleWatchEpisode(ep)}
                    className={`group/card relative shrink-0 flex flex-col justify-end aspect-[16/9.5] rounded-2xl overflow-hidden bg-[#12151c] shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] select-none ${
                      isActive
                        ? "border-2 border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/20"
                        : "border border-transparent hover:border-white/10"
                    }`}
                    style={{ width: `${itemWidth}px` }}
                  >
                    {/* Thumbnail Background */}
                    {ep.still ? (
                      <Image
                        src={ep.still}
                        alt={ep.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                        sizes="(max-width: 640px) 280px, 310px"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs text-zinc-600">
                        No Preview Still
                      </div>
                    )}

                    {/* Gradient Scrim (No border) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent pointer-events-none" />

                    {/* Play Hover Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                      <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover/card:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Card Bottom Content (Chapter, Overview, and Real Duration) */}
                    <div className="relative z-10 p-4 sm:p-5 space-y-1.5 pointer-events-none">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4
                            className={`text-base sm:text-lg font-bold tracking-wide truncate ${
                              isActive ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            Chapter {ep.displayEpisodeNumber}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500 text-black shrink-0">
                              Playing
                            </span>
                          )}
                        </div>
                        {ep.runtime && (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 shrink-0">
                            {ep.runtime}
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-300/80 text-xs sm:text-[13px] leading-relaxed line-clamp-2">
                        {ep.overview || ep.title || "The chapter storyline stream..."}
                      </p>
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
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c202a]/95 hover:bg-black text-white items-center justify-center transition-all duration-200 border border-white/15 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Next episodes"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
