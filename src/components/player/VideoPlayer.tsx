"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Film,
  FastForward,
  Maximize,
  Minimize,
  RefreshCw,
  SkipForward,
  X,
} from "lucide-react";
import { VideoSource } from "@/infrastructure/video/video.types";
import { EpisodeItem, SeasonItem } from "@/domain/movie/movie.types";

interface VendorFullscreenElement extends HTMLDivElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

interface VendorFullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
}

interface VideoPlayerProps {
  source?: VideoSource | null;
  tmdbId?: string;
  movieId?: string;
  imdbId?: string;
  title: string;
  releaseYear?: number;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  episodeId?: string;
  poster?: string;
  nextEpisodeUrl?: string;
  tvId?: string;
  currentSeason?: number;
  currentEpisode?: number;
  seasons?: SeasonItem[];
  episodes?: EpisodeItem[];
}

interface ServerOption {
  id: string;
  name: string;
  tag: string;
}

const SERVERS: ServerOption[] = [
  { id: "vidsrc", name: "Server 1", tag: "VidSrc (Mặc định)" },
  { id: "vidlink", name: "Server 2", tag: "VidLink (Fast)" },
  { id: "2embed", name: "Server 3", tag: "2Embed" },
];

export default function VideoPlayer({
  tmdbId,
  movieId,
  title,
  type,
  season,
  episode,
  poster,
  nextEpisodeUrl,
  tvId,
  currentSeason,
  currentEpisode,
  seasons,
  episodes,
}: VideoPlayerProps) {
  const [selectedServer, setSelectedServer] = useState<string>("vidsrc");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userSelectedSeason, setUserSelectedSeason] = useState<number | null>(null);
  const [userSelectedEpisode, setUserSelectedEpisode] = useState<number | null>(null);

  const activeSeason = userSelectedSeason ?? (currentSeason ?? season ?? 1);
  const activeEpisode = userSelectedEpisode ?? (currentEpisode ?? episode ?? 1);

  const [autoNext, setAutoNext] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControlsHud, setShowControlsHud] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);



  // Determine effective IDs (supports props or fallback to URL pathname)
  const getResolvedIds = useCallback(() => {
    const isClient = typeof window !== "undefined";
    const pathname = isClient ? window.location.pathname : "";

    const clean = (val?: string) => {
      if (!val || val === "undefined" || val === "null") return undefined;
      const s = String(val).trim();
      return s.length > 0 && s !== "undefined" && s !== "null" ? s : undefined;
    };

    const parsedMoviePathId = (!tvId && pathname.includes("/watch/movie/"))
      ? pathname.match(/\/watch\/movie\/([^/?#]+)/)?.[1]
      : undefined;

    const parsedTvPathId = pathname.includes("/watch/tv/")
      ? pathname.match(/\/watch\/tv\/([^/?#]+)/)?.[1]
      : undefined;

    const resolvedMovieId = clean(tmdbId) || clean(movieId) || clean(parsedMoviePathId);
    const resolvedTvId = clean(tvId) || (type === "tv" ? clean(tmdbId) : undefined) || clean(parsedTvPathId);

    return { resolvedMovieId, resolvedTvId };
  }, [tmdbId, movieId, tvId, type]);

  // Dynamic URL builder supporting Multi-Server (VidSrc default, VidLink, 2Embed)
  const iframeSrc = useMemo(() => {
    const { resolvedMovieId, resolvedTvId } = getResolvedIds();
    const isTv = type === "tv" || !!resolvedTvId;
    const targetId = isTv ? (resolvedTvId || tmdbId || tvId) : (resolvedMovieId || tmdbId || movieId);
    const cleanTargetId = String(targetId || "").trim();

    if (!cleanTargetId || cleanTargetId === "undefined" || cleanTargetId === "null") {
      return "";
    }

    const s = activeSeason ?? currentSeason ?? season ?? 1;
    const ep = activeEpisode ?? currentEpisode ?? episode ?? 1;

    // Server 1 (Default): VidSrc - Extremely reliable, no X-Frame-Options block
    if (selectedServer === "vidsrc") {
      if (isTv) {
        return `https://vidsrc.me/embed/tv?tmdb=${cleanTargetId}&season=${s}&episode=${ep}`;
      }
      return `https://vidsrc.me/embed/movie?tmdb=${cleanTargetId}`;
    }

    // Server 3: 2Embed
    if (selectedServer === "2embed") {
      if (isTv) {
        return `https://www.2embed.cc/embedtv/${cleanTargetId}?s=${s}&e=${ep}`;
      }
      return `https://www.2embed.cc/embed/${cleanTargetId}`;
    }

    // Server 2: VidLink with Emerald Theme
    const params = new URLSearchParams({
      primaryColor: "10b981",
      secondaryColor: "10b981",
      iconColor: "10b981",
      title: "true",
      poster: "true",
      autoplay: "false",
    });

    if (isTv) {
      return `https://vidlink.pro/tv/${cleanTargetId}/${s}/${ep}?${params.toString()}`;
    }

    return `https://vidlink.pro/movie/${cleanTargetId}?${params.toString()}`;
  }, [
    getResolvedIds,
    type,
    tmdbId,
    tvId,
    movieId,
    activeSeason,
    currentSeason,
    season,
    activeEpisode,
    currentEpisode,
    episode,
    selectedServer,
  ]);

  // Handle iframe load event: smoothly fade out cinematic overlay
  const handleIframeLoad = useCallback(() => {
    if (loadSafetyTimerRef.current) {
      clearTimeout(loadSafetyTimerRef.current);
      loadSafetyTimerRef.current = null;
    }
    // Small buffer delay to allow the video player skin to initialize cleanly
    setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
    }, 600);
  }, []);

  // When iframe source updates, trigger loading state and start safety timeout
  useEffect(() => {
    if (!iframeSrc) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasError(true);
        setErrorMessage("Không tìm thấy thông tin phim hoặc TMDB ID không hợp lệ.");
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
    }, 0);

    // Safety fallback: if iframe load event doesn't trigger, reveal player after 7s
    if (loadSafetyTimerRef.current) clearTimeout(loadSafetyTimerRef.current);
    loadSafetyTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 7000);

    return () => {
      clearTimeout(timer);
      if (loadSafetyTimerRef.current) clearTimeout(loadSafetyTimerRef.current);
    };
  }, [iframeSrc]);

  // Explicitly apply multi-vendor fullscreen attributes to support nested embed player engines
  useEffect(() => {
    if (iframeRef.current) {
      try {
        iframeRef.current.setAttribute("allowfullscreen", "true");
        iframeRef.current.setAttribute("webkitallowfullscreen", "true");
        iframeRef.current.setAttribute("mozallowfullscreen", "true");
      } catch {
        // Ignore
      }
    }
  }, [iframeSrc]);

  // Helper to calculate next episode target across seasons
  const getNextEpisodeTarget = useCallback(
    (seasonNum?: number, epNum?: number): { season: number; episode: number } | null => {
      const { resolvedTvId } = getResolvedIds();
      if (!resolvedTvId) return null;

      const s = seasonNum !== undefined ? seasonNum : (activeSeason || 1);
      const ep = epNum !== undefined ? epNum : (activeEpisode || 1);

      if (seasons && seasons.length > 0) {
        const currentSeasonObj = seasons.find((item) => Number(item.seasonNumber) === Number(s));
        const seasonMaxEpisodes = currentSeasonObj?.episodeCount || episodes?.length || 0;

        // Case 1: More episodes exist in current season
        if (ep < seasonMaxEpisodes) {
          return { season: s, episode: ep + 1 };
        }

        // Case 2: Current season completed, transition to next season
        const nextSeasonObj = seasons.find((item) => Number(item.seasonNumber) === Number(s) + 1);
        if (nextSeasonObj && nextSeasonObj.episodeCount > 0) {
          return { season: s + 1, episode: 1 };
        }

        return null;
      }

      // Fallback: parse nextEpisodeUrl if available
      if (nextEpisodeUrl) {
        const match = nextEpisodeUrl.match(/\/watch\/tv\/[^/]+\/(\d+)\/(\d+)/);
        if (match) {
          return { season: parseInt(match[1], 10), episode: parseInt(match[2], 10) };
        }
      }

      return null;
    },
    [getResolvedIds, seasons, episodes, nextEpisodeUrl, activeSeason, activeEpisode]
  );

  const nextTarget = useMemo(() => getNextEpisodeTarget(), [getNextEpisodeTarget]);
  const hasNextEpisode = nextTarget !== null;

  // In-place episode switcher: seamlessly updates iframe without page reload
  const switchToEpisode = useCallback(
    (newSeason: number, newEpisode: number) => {
      const { resolvedTvId } = getResolvedIds();
      if (!resolvedTvId) return;

      setUserSelectedSeason(newSeason);
      setUserSelectedEpisode(newEpisode);
      setCountdown(null);
      setIsLoading(true);

      // 1. Dispatch custom event for real-time synchronization in EpisodesTab
      window.dispatchEvent(
        new CustomEvent("zeflix:episode-changed", {
          detail: { season: newSeason, episode: newEpisode },
        })
      );

      // 2. Update browser address bar without triggering Next.js route reload
      window.history.replaceState(null, "", `/watch/tv/${resolvedTvId}/${newSeason}/${newEpisode}`);
    },
    [getResolvedIds]
  );

  // Listen for external episode changes from EpisodesTab clicks (with clean unmount cleanup)
  useEffect(() => {
    const handleChangeEpisode = (e: Event) => {
      const customEvent = e as CustomEvent<{ season: number; episode: number }>;
      if (!customEvent.detail) return;
      const { season: s, episode: ep } = customEvent.detail;
      switchToEpisode(Number(s), Number(ep));
    };

    window.addEventListener("zeflix:change-episode", handleChangeEpisode);
    return () => {
      window.removeEventListener("zeflix:change-episode", handleChangeEpisode);
    };
  }, [switchToEpisode]);

  // Fullscreen management on outer container
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current as VendorFullscreenElement;
    const doc = document as VendorFullscreenDocument;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => { });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => { });
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  // Listen for fullscreen change events & keyboard shortcut 'F'
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as VendorFullscreenDocument;
      const fullElem =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      const isFull = !!fullElem;
      setIsFullscreen(isFull);
      if (isFull) {
        setShowControlsHud(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  // Auto-hide HUD controls after 3 seconds of inactivity
  const handleUserActivity = useCallback(() => {
    setShowControlsHud(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setShowControlsHud(false);
    }, 3000);
  }, []);

  // Countdown timer for Auto-Next
  useEffect(() => {
    if (countdown === null) return;

    countdownTimerRef.current = setTimeout(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (nextTarget) {
            switchToEpisode(nextTarget.season, nextTarget.episode);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, nextTarget, switchToEpisode]);

  // Listen for VidLink player completion messages via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("vidlink.pro")) return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (
          data?.type === "MEDIA_ENDED" ||
          data?.event === "ended" ||
          data?.action === "ended"
        ) {
          if (nextTarget && autoNext) {
            setCountdown(10);
          }
        }
      } catch {
        // Ignore non-json postMessages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [nextTarget, autoNext]);

  return (
    <div className="w-full space-y-4">
      {/* Outer Video Container with Fullscreen elevation */}
      <div
        ref={containerRef}
        onMouseMove={handleUserActivity}
        onMouseEnter={handleUserActivity}
        onMouseLeave={() => setShowControlsHud(false)}
        className={`group/player relative w-full bg-black shadow-2xl overflow-hidden select-none ${isFullscreen
            ? "fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center rounded-none"
            : "aspect-video rounded-2xl"
          }`}
      >
        {/* Fullscreen Floating Controls & Info HUD */}
        {isFullscreen && showControlsHud && (
          <div className="absolute top-0 inset-x-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-auto">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-base sm:text-lg tracking-wide drop-shadow-md">
                {title}
              </span>
              {activeSeason && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  S{activeSeason} : E{activeEpisode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {nextTarget && (
                <button
                  type="button"
                  onClick={() => switchToEpisode(nextTarget.season, nextTarget.episode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg active:scale-95"
                  title={`Play Next S${nextTarget.season} E${nextTarget.episode}`}
                >
                  <span>Next S{nextTarget.season} E{nextTarget.episode}</span>
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg"
                title="Exit Fullscreen (F / Esc)"
              >
                <Minimize className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>
        )}

        {/* Sleek Floating Next Episode Button (Hides when idle in normal mode) */}
        {!isFullscreen && nextTarget && !isLoading && !hasError && (
          <div
            className={`absolute bottom-16 right-4 sm:bottom-20 sm:right-6 z-30 transition-all duration-300 ${showControlsHud
                ? "opacity-100 pointer-events-auto translate-y-0"
                : "opacity-0 pointer-events-none translate-y-2"
              }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                switchToEpisode(nextTarget.season, nextTarget.episode);
              }}
              className="group/next inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#161a23]/95 hover:bg-emerald-500 text-white hover:text-black text-xs sm:text-sm font-bold backdrop-blur-md transition-all cursor-pointer shadow-2xl border border-white/20 hover:border-emerald-400 active:scale-95"
              title={`Next S${nextTarget.season} E${nextTarget.episode}`}
            >
              <span>Next S{nextTarget.season} E{nextTarget.episode}</span>
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current transition-transform group-hover/next:translate-x-0.5" />
            </button>
          </div>
        )}



        {/* Cinematic Loading Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-40 bg-[#06080c] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            {poster && (
              <Image
                src={poster}
                alt={title}
                fill
                priority
                className="object-cover opacity-15 blur-md scale-105 transition-transform duration-1000 ease-out pointer-events-none"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            )}

            {/* Dark Radial Vignette Scrim */}
            <div className="absolute inset-0 bg-radial from-transparent via-[#06080c]/80 to-[#06080c] pointer-events-none" />

            {/* Glowing Film Icon */}
            <div className="relative z-10 grid place-items-center w-24 h-24">
              {/* Outer pulsing ring */}
              <div className="col-start-1 row-start-1 w-20 h-20 rounded-full border border-emerald-500/30 bg-emerald-500/10 animate-ping pointer-events-none" />

              {/* Center glow halo */}
              <div className="col-start-1 row-start-1 w-16 h-16 rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

              {/* Main glass circle with Film icon */}
              <div className="col-start-1 row-start-1 w-16 h-16 rounded-full border border-emerald-500/40 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.35)]">
                <Film className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Auto Next Countdown Overlay */}
        {countdown !== null && nextTarget && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3">
              <FastForward className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-custom1">
              Next S{nextTarget.season} E{nextTarget.episode} starting in {countdown}s
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-5 font-custom2">
              Auto Next is enabled
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCountdown(null)}
                className="font-custom2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-zinc-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={() => switchToEpisode(nextTarget.season, nextTarget.episode)}
                className="font-custom2 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs sm:text-sm font-bold text-black shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Play S{nextTarget.season} E{nextTarget.episode}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Overlay with Retry */}
        {hasError && (
          <div className="absolute inset-0 z-30 bg-[#0a0d14] flex flex-col items-center justify-center gap-4 p-6 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-bold text-white">
                Unable to load stream at this moment.
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {errorMessage || "The media stream source may be unreachable or experiencing high load. Please try again."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setHasError(false);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20 mt-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Stream</span>
            </button>
          </div>
        )}



        {/* Stream Iframe Player */}
        {iframeSrc && !hasError && (
          <iframe
            ref={iframeRef}
            key={`${selectedServer}-${iframeSrc}`}
            src={iframeSrc}
            title={title}
            className="w-full h-full border-0 absolute inset-0 z-10"
            allow="accelerometer *; autoplay *; clipboard-write; encrypted-media *; gyroscope *; picture-in-picture *; web-share *; fullscreen *"
            allowFullScreen
            referrerPolicy="origin"
            onLoad={handleIframeLoad}
          />
        )}
      </div>

      {/* Control Bar: Multi-Server Switcher, Quick Seek & Fullscreen Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left: Server Selection Pills */}
        <div className="flex items-center gap-1 bg-[#12151c] p-1 rounded-xl border border-zinc-800">
          {SERVERS.map((srv) => (
            <button
              key={srv.id}
              type="button"
              onClick={() => {
                if (selectedServer !== srv.id) {
                  setSelectedServer(srv.id);
                  setIsLoading(true);
                  setHasError(false);
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedServer === srv.id
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              title={`Switch to ${srv.name}`}
            >
              {srv.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {tvId && hasNextEpisode && (
            <button
              type="button"
              onClick={() => setAutoNext((prev) => !prev)}
              className={`font-custom2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none border ${autoNext
                  ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20 hover:bg-emerald-500/25"
                  : "bg-[#161a23] border-zinc-700/80 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
                }`}
              title="Toggle automatic playback for the next episode"
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${autoNext ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
              />
              <span>Auto Next</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161a23] border border-zinc-700/80 hover:border-zinc-500 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none"
            title="Toggle Fullscreen (F)"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
