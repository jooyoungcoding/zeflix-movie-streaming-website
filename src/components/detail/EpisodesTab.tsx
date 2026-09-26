"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { EpisodeItem, SeasonItem } from "@/domain/movie/movie.types";
import { WatchCategory } from "@/features/playback/types/playback.types";

interface EpisodesTabProps {
  tvId: string;
  category?: WatchCategory;
  seasons: SeasonItem[];
  initialEpisodes: EpisodeItem[];
  currentSeasonNumber: number;
  activeEpisodeNumber?: number;
  activeSeasonNumber?: number;
}

export default function EpisodesTab({
  tvId,
  category,
  seasons,
  initialEpisodes,
  currentSeasonNumber,
  activeEpisodeNumber: initialActiveEp,
  activeSeasonNumber: initialActiveSeason,
}: EpisodesTabProps) {
  const router = useRouter();
  const [selectedSeason, setSelectedSeason] = useState<number>(
    initialActiveSeason || currentSeasonNumber
  );
  const [activeEpisode, setActiveEpisode] = useState<number | undefined>(
    initialActiveEp
  );
  const [activeSeason, setActiveSeason] = useState<number | undefined>(
    initialActiveSeason
  );
  const [episodes, setEpisodes] = useState<EpisodeItem[]>(initialEpisodes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Mouse drag-to-scroll support for desktop
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Card dimensions in px
  const itemWidth = 310;
  const gap = 20;
  const itemStep = itemWidth + gap;

  const isFirstRender = useRef(true);

  // Dynamic indicator for navigation arrows and gradient fades
  const updateArrows = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 10);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, episodes]);

  // Keep state in sync with props when active season or episode changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const s =
      initialActiveSeason !== undefined
        ? Number(initialActiveSeason)
        : Number(currentSeasonNumber);
    const ep =
      initialActiveEp !== undefined ? Number(initialActiveEp) : undefined;
    setActiveEpisode(ep);
    setActiveSeason(s);
    setSelectedSeason(s);
    setEpisodes(initialEpisodes);
    setHasError(false);
    setErrorMessage("");
  }, [initialActiveEp, initialActiveSeason, currentSeasonNumber, initialEpisodes]);

  // Cleanup pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Listen for real-time episode changes triggered by the video player
  // Robust Season Episodes Fetcher with Timeout, Auto-Retry and Error Handling
  const fetchSeasonEpisodes = useCallback(
    async (seasonNum: number, maxRetries = 2) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      let lastError: unknown = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (controller.signal.aborted) return;

        try {
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(`/api/tv/${tvId}/season/${seasonNum}`, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
          }

          const data = await res.json();

          if (data && Array.isArray(data.episodes)) {
            const seasonMeta = seasons.find(
              (s) => Number(s.seasonNumber) === Number(seasonNum)
            );
            const expectedCount = seasonMeta?.episodeCount ?? 0;

            // If metadata says season has episodes but API returned 0 (e.g. upstream timeout), retry if attempts remain
            if (expectedCount > 0 && data.episodes.length === 0 && attempt < maxRetries) {
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
              continue;
            }

            setEpisodes(data.episodes);
            setHasError(false);
            setIsLoading(false);
            return;
          } else {
            throw new Error("Invalid response format");
          }
        } catch (err: unknown) {
          if (controller.signal.aborted) return;
          lastError = err;
          console.warn(
            `[EpisodesTab] Fetch season ${seasonNum} attempt ${attempt + 1} failed:`,
            err
          );
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }

      if (!controller.signal.aborted) {
        setHasError(true);
        setErrorMessage(
          lastError instanceof Error && lastError.name === "AbortError"
            ? "Request timed out while loading episodes."
            : "Unable to load episodes due to network or server delay."
        );
        setIsLoading(false);
      }
    },
    [tvId, seasons]
  );

  // Listen for real-time episode changes triggered by the video player
  useEffect(() => {
    const handleEpisodeChange = async (e: Event) => {
      const customEvent = e as CustomEvent<{ season: number; episode: number }>;
      if (!customEvent.detail) return;
      const newSeason = Number(customEvent.detail.season);
      const newEpisode = Number(customEvent.detail.episode);

      setActiveEpisode(newEpisode);
      setActiveSeason(newSeason);

      if (newSeason !== selectedSeason) {
        setSelectedSeason(newSeason);
        fetchSeasonEpisodes(newSeason);
      }
    };

    window.addEventListener("zeflix:episode-changed", handleEpisodeChange);
    return () => {
      window.removeEventListener("zeflix:episode-changed", handleEpisodeChange);
    };
  }, [selectedSeason, fetchSeasonEpisodes]);

  // Auto-scroll to active episode, centering it inside the viewport
  // Works identically on PC and mobile with NO clipping of earlier episodes
  useEffect(() => {
    if (
      activeEpisode === undefined ||
      activeSeason === undefined ||
      Number(selectedSeason) !== Number(activeSeason)
    )
      return;

    const activeIdx = episodes.findIndex(
      (e) => Number(e.episodeNumber) === Number(activeEpisode)
    );
    if (activeIdx < 0) return;

    const scrollToActive = (behavior: ScrollBehavior = "smooth") => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const targetScrollLeft = Math.max(
        0,
        activeIdx * itemStep - (el.clientWidth - itemWidth) / 2
      );
      el.scrollTo({ left: targetScrollLeft, behavior });
    };

    // Instant scroll on mount/change, then smooth adjustment to account for layout settling
    scrollToActive("instant");
    const timer = setTimeout(() => {
      scrollToActive("smooth");
      updateArrows();
    }, 120);

    return () => clearTimeout(timer);
  }, [activeEpisode, activeSeason, selectedSeason, episodes, itemStep, itemWidth, updateArrows]);

  const handleSelectSeason = (seasonNum: number) => {
    if (seasonNum === selectedSeason && !hasError && episodes.length > 0) {
      setIsDropdownOpen(false);
      return;
    }

    setSelectedSeason(seasonNum);
    setIsDropdownOpen(false);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "instant" });
    }

    fetchSeasonEpisodes(seasonNum);
  };

  const handleWatchEpisode = (ep: EpisodeItem) => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const effectiveCategory: WatchCategory =
      category ||
      (path.includes("/anime/")
        ? "anime"
        : path.includes("/sentai/")
        ? "sentai"
        : "normal");

    const seasonNum = ep.seasonNumber ?? 1;
    const targetUrl = `/watch/tv/${effectiveCategory}/${tvId}/${seasonNum}/${ep.episodeNumber}`;

    setActiveEpisode(ep.episodeNumber);
    setActiveSeason(ep.seasonNumber);

    // Center active episode immediately in view
    if (scrollContainerRef.current) {
      const epIdx = episodes.findIndex(
        (e) => Number(e.episodeNumber) === Number(ep.episodeNumber)
      );
      if (epIdx >= 0) {
        const targetScrollLeft = Math.max(
          0,
          epIdx * itemStep - (scrollContainerRef.current.clientWidth - itemWidth) / 2
        );
        scrollContainerRef.current.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
      }
    }

    // Notify mounted VideoPlayer component to hot-switch the stream immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("zeflix:change-episode", {
          detail: {
            season: ep.seasonNumber,
            episode: ep.episodeNumber,
          },
        })
      );
    }

    // Navigate to the target episode URL
    // If already on a watch page, replace the current history entry instead of pushing
    // a new one so clicking Back returns to the actual previous page (e.g. series detail)
    const isAlreadyOnWatchPage = path.includes("/watch/");
    if (isAlreadyOnWatchPage) {
      router.replace(targetUrl, { scroll: false });
    } else {
      router.push(targetUrl);
    }

    if (typeof document !== "undefined" && !document.fullscreenElement) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: -itemStep * 2,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: itemStep * 2,
      behavior: "smooth",
    });
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftStart.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    if (Math.abs(walk) > 6) {
      hasMoved.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

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
      <div className="flex items-center justify-between relative z-40">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-custom2">
          {episodeRangeText}
        </h3>

        {/* Season Selector Dropdown */}
        {seasons.length > 0 && (
          <div className="relative z-50">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c202a] hover:bg-[#252b38] text-white text-xs sm:text-sm font-semibold border border-white/10 transition-all cursor-pointer shadow-lg"
            >
              <span>{currentSeasonObj?.name || `Season ${selectedSeason}`}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-44 bg-[#191d26] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
                style={{ maxHeight: "calc(6 * 36px + 12px)" }}
              >
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

        {/* Scroll Track: Native smooth scroll container on BOTH mobile and desktop */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full overflow-x-auto py-1 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none sm:cursor-grab sm:active:cursor-grabbing"
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
          ) : hasError ? (
            <div className="py-10 px-4 text-center bg-[#12151c]/60 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3.5 my-1">
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-white text-sm sm:text-base font-bold">
                  Failed to load Season {selectedSeason} episodes
                </h4>
                <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed">
                  {errorMessage || "The provider or network took too long to respond. Please try again."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchSeasonEpisodes(selectedSeason)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : episodes.length === 0 ? (
            <div className="py-10 px-4 text-center bg-[#12151c]/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 my-1">
              <p className="text-zinc-400 text-sm">
                No episodes available for Season {selectedSeason}.
              </p>
              <button
                type="button"
                onClick={() => fetchSeasonEpisodes(selectedSeason)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-white/10"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div
              className="flex items-start"
              style={{ gap: `${gap}px` }}
            >
              {episodes.map((ep) => {
                const isActive =
                  activeSeason !== undefined &&
                  activeEpisode !== undefined &&
                  Number(selectedSeason) === Number(activeSeason) &&
                  Number(ep.episodeNumber) === Number(activeEpisode);

                return (
                  <div
                    key={ep.id || ep.displayEpisodeNumber}
                    onClick={() => {
                      if (hasMoved.current) return;
                      handleWatchEpisode(ep);
                    }}
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

                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent pointer-events-none" />

                    {/* Play Hover Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                      <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover/card:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Card Bottom Content */}
                    <div className="relative z-10 p-4 sm:p-5 space-y-1.5 pointer-events-none">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4
                            className={`text-base sm:text-lg font-bold tracking-wide truncate ${
                              isActive ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            Episode {ep.displayEpisodeNumber}
                          </h4>
                        </div>
                        {ep.runtime && (
                          <span className="text-xs font-semibold text-gray bg-gray px-2.5 py-0.5 rounded-lg border border-gray-500/30 shrink-0">
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
