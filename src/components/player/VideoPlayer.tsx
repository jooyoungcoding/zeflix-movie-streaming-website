"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  Play,
  RefreshCw,
  SkipForward,
  FastForward,
  X,
  Minimize,
} from "lucide-react";
import { VideoSource, VideoServerOption } from "@/infrastructure/video/video.types";
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
  source: VideoSource | null;
  title: string;
  poster?: string;
  nextEpisodeUrl?: string;
  tvId?: string;
  currentSeason?: number;
  currentEpisode?: number;
  seasons?: SeasonItem[];
  episodes?: EpisodeItem[];
}

export default function VideoPlayer({
  source,
  title,
  poster,
  nextEpisodeUrl,
  tvId,
  currentSeason,
  currentEpisode,
  seasons,
  episodes,
}: VideoPlayerProps) {
  const router = useRouter();

  // Sync server list and initialize selected server
  const servers: VideoServerOption[] = useMemo(
    () =>
      source?.servers ||
      (source?.url ? [{ id: "default", name: "Default Server", url: source.url }] : []),
    [source]
  );

  const [selectedServerUrl, setSelectedServerUrl] = useState<string>(
    () => servers[0]?.url || source?.url || ""
  );
  const [activeSeason, setActiveSeason] = useState<number | undefined>(currentSeason);
  const [activeEpisode, setActiveEpisode] = useState<number | undefined>(currentEpisode);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [autoNext, setAutoNext] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControlsHud, setShowControlsHud] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSeasonRef = useRef<number | undefined>(currentSeason);
  const currentEpisodeRef = useRef<number | undefined>(currentEpisode);
  const selectedServerUrlRef = useRef<string>(servers[0]?.url || source?.url || "");
  const isFirstRender = useRef<boolean>(true);

  // Sync season/episode state during render when props change without cascading renders
  const [prevEpisodes, setPrevEpisodes] = useState({ currentSeason, currentEpisode });
  if (
    prevEpisodes.currentSeason !== currentSeason ||
    prevEpisodes.currentEpisode !== currentEpisode
  ) {
    setPrevEpisodes({ currentSeason, currentEpisode });
    setActiveSeason(currentSeason);
    setActiveEpisode(currentEpisode);
  }

  // Synchronize ref with current active season/episode for event handlers
  useEffect(() => {
    currentSeasonRef.current = activeSeason;
    currentEpisodeRef.current = activeEpisode;
  }, [activeSeason, activeEpisode]);

  useEffect(() => {
    selectedServerUrlRef.current = selectedServerUrl;
  }, [selectedServerUrl]);

  // Initial safety timeout on mount
  useEffect(() => {
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 8000);
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  // Sync on source/reloadKey change (skip first mount to avoid cascading setState)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const targetUrl = servers[0]?.url || source?.url || "";
    setSelectedServerUrl(targetUrl);
    setIsLoading(true);
    setHasError(false);
    setCountdown(null);

    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [source?.url, reloadKey, servers]);

  // Helper to calculate the exact next (season, episode) target across season boundaries
  const getNextEpisodeTarget = useCallback(
    (seasonNum?: number, epNum?: number): { season: number; episode: number } | null => {
      if (!tvId) return null;
      const s = seasonNum !== undefined ? seasonNum : (activeSeason || 1);
      const ep = epNum !== undefined ? epNum : (activeEpisode || 1);

      if (seasons && seasons.length > 0) {
        const currentSeasonObj = seasons.find((item) => Number(item.seasonNumber) === Number(s));
        const seasonMaxEpisodes = currentSeasonObj?.episodeCount || episodes?.length || 0;

        // Case 1: More episodes exist in the current season
        if (ep < seasonMaxEpisodes) {
          return { season: s, episode: ep + 1 };
        }

        // Case 2: Current season is finished, check if next season exists with episodes
        const nextSeasonObj = seasons.find((item) => Number(item.seasonNumber) === Number(s) + 1);
        if (nextSeasonObj && nextSeasonObj.episodeCount > 0) {
          return { season: s + 1, episode: 1 };
        }

        // Case 3: Series finale (no more episodes/seasons)
        return null;
      }

      // Fallback: parse nextEpisodeUrl
      if (nextEpisodeUrl) {
        const match = nextEpisodeUrl.match(/\/watch\/tv\/[^\/]+\/(\d+)\/(\d+)/);
        if (match) {
          return { season: parseInt(match[1], 10), episode: parseInt(match[2], 10) };
        }
      }

      return null;
    },
    [tvId, seasons, episodes, nextEpisodeUrl, activeSeason, activeEpisode]
  );

  // Helper to dynamically check if a next episode exists (same season or next season)
  const checkHasNextEpisode = useCallback(
    (seasonNum?: number, epNum?: number): boolean => {
      return getNextEpisodeTarget(seasonNum, epNum) !== null;
    },
    [getNextEpisodeTarget]
  );

  // Calculate continuous display episode number across seasons if needed
  const getDisplayEpisodeNumber = useCallback(
    (targetSeason: number, targetEp: number): number => {
      if (!seasons || seasons.length === 0) return targetEp;
      let offset = 0;
      for (const s of seasons) {
        if (Number(s.seasonNumber) < Number(targetSeason)) {
          offset += s.episodeCount || 0;
        }
      }
      return offset + targetEp;
    },
    [seasons]
  );

  // Helper to construct TV series server URL dynamically for any season/episode
  const buildServerUrl = useCallback(
    (currentUrl: string, season: number, episode: number): string => {
      if (!tvId) return currentUrl;
      const s = Math.max(1, Math.floor(season));
      const ep = Math.max(1, Math.floor(episode));

      // Always disable VidLink's native gray next button so only our sleek bottom-right Zeflix button is used
      if (currentUrl.includes("vidlink.pro")) {
        return `https://vidlink.pro/tv/${tvId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true&nextbutton=false`;
      }
      if (currentUrl.includes("2embed.cc")) {
        return `https://www.2embed.cc/embedtv/${tvId}?s=${s}&e=${ep}`;
      }
      if (currentUrl.includes("autoembed.cc")) {
        return `https://player.autoembed.cc/embed/tv/${tvId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true`;
      }
      if (currentUrl.includes("vidsrc.to")) {
        return `https://vidsrc.to/embed/tv/${tvId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true`;
      }

      // Default fallback
      return `https://vidlink.pro/tv/${tvId}/${s}/${ep}?primaryColor=10b981&secondaryColor=12151c&iconColor=ffffff&autoplay=true&nextbutton=false`;
    },
    [tvId]
  );

  // In-place episode switcher: switches video stream, updates URL and synced components WITHOUT unmounting or exiting fullscreen
  const switchToEpisode = useCallback(
    (season: number, episode: number) => {
      if (!tvId) return;

      setActiveSeason(season);
      setActiveEpisode(episode);
      currentSeasonRef.current = season;
      currentEpisodeRef.current = episode;
      setCountdown(null);
      setIsLoading(true);
      setHasError(false);

      const newUrl = buildServerUrl(selectedServerUrlRef.current, season, episode);
      setSelectedServerUrl(newUrl);

      // Reset safety-net timeout so loading never gets permanently stuck after episode switch
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 8000);

      // 1. Dispatch custom event for real-time UI synchronization in EpisodesTab
      window.dispatchEvent(
        new CustomEvent("zeflix:episode-changed", {
          detail: { season, episode },
        })
      );

      // 2. Update address bar in real-time without unmounting fullscreen player
      window.history.replaceState(
        null,
        "",
        `/watch/tv/${tvId}/${season}/${episode}`
      );
    },
    [tvId, buildServerUrl]
  );

  // Fullscreen management on the outer container element to prevent browser shrinking on stream navigation
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current as VendorFullscreenElement;
    const doc = document as VendorFullscreenDocument;

    if (!doc.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
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

        // Auto-upgrade: If fullscreen was initiated directly on the inner iframe element (e.g. user clicked icon in video player),
        // immediately elevate fullscreen to the outer container so Next Episode stream reloads will NEVER exit fullscreen!
        if (
          containerRef.current &&
          fullElem !== containerRef.current &&
          containerRef.current.contains(fullElem)
        ) {
          try {
            const el = containerRef.current as VendorFullscreenElement;
            if (el.requestFullscreen) {
              el.requestFullscreen().catch(() => {});
            } else if (el.webkitRequestFullscreen) {
              el.webkitRequestFullscreen();
            }
          } catch {
            // Ignore if browser restricts elevation
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

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

  // Handle user activity (mouse move / touch / hover) to auto-show/hide overlay buttons
  const handleUserActivity = useCallback(() => {
    setShowControlsHud(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setShowControlsHud(false);
    }, 3500);
  }, []);

  // Listen for external episode change requests (from EpisodesTab clicks)
  useEffect(() => {
    const handleChangeEpisode = (e: Event) => {
      const customEvent = e as CustomEvent<{ season: number; episode: number }>;
      if (!customEvent.detail || !tvId) return;
      const { season, episode } = customEvent.detail;
      switchToEpisode(Number(season), Number(episode));
    };

    window.addEventListener("zeflix:change-episode", handleChangeEpisode);
    return () => {
      window.removeEventListener("zeflix:change-episode", handleChangeEpisode);
    };
  }, [tvId, switchToEpisode]);

  // Handle postMessage from video provider to dismiss loading overlay & handle auto-next / episode sync
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            // Not a JSON string, ignore
          }
        }

        if (!data || typeof data !== "object") return;

        // Ready / Play event
        if (
          data?.event === "play" ||
          data?.event === "ready" ||
          data?.event === "timeupdate" ||
          data?.type === "PLAYER_EVENT" ||
          data?.type === "MEDIA_DATA" ||
          data?.type === "ready" ||
          data?.action === "ready"
        ) {
          setIsLoading(false);
        }

        // Deep helper to extract season and episode numbers from any nested structure
        const findNum = (obj: unknown, keys: string[]): number | undefined => {
          if (!obj || typeof obj !== "object") return undefined;
          const rec = obj as Record<string, unknown>;
          for (const k of keys) {
            if (rec[k] !== undefined && rec[k] !== null && rec[k] !== "") {
              const val = parseInt(String(rec[k]), 10);
              if (!isNaN(val) && val > 0) return val;
            }
          }
          return undefined;
        };

        const seasonKeys = [
          "season",
          "season_number",
          "seasonNumber",
          "current_season",
          "currentSeason",
          "s",
        ];
        const episodeKeys = [
          "episode",
          "episode_number",
          "episodeNumber",
          "current_episode",
          "currentEpisode",
          "ep",
        ];

        const eventSeason =
          findNum(data, seasonKeys) ??
          findNum(data.data, seasonKeys) ??
          findNum(data.media, seasonKeys) ??
          findNum(data.detail, seasonKeys) ??
          findNum(data.item, seasonKeys);

        const eventEpisode =
          findNum(data, episodeKeys) ??
          findNum(data.data, episodeKeys) ??
          findNum(data.media, episodeKeys) ??
          findNum(data.detail, episodeKeys) ??
          findNum(data.item, episodeKeys);

        // Check if an explicit next button click event was emitted by the player
        const isNextAction =
          data?.event === "next" ||
          data?.event === "next_episode" ||
          data?.event === "nextEpisode" ||
          data?.type === "NEXT_EPISODE" ||
          data?.type === "next_episode" ||
          data?.type === "next" ||
          data?.action === "next" ||
          data?.data?.event === "next" ||
          data?.data?.event === "next_episode" ||
          data?.data?.action === "next" ||
          data?.data?.type === "NEXT_EPISODE" ||
          data?.data?.type === "next_episode";

        let targetSeason = eventSeason;
        let targetEpisode = eventEpisode;

        if (
          (targetSeason === undefined || targetEpisode === undefined) &&
          isNextAction
        ) {
          const nextTarget = getNextEpisodeTarget();
          if (nextTarget) {
            targetSeason = nextTarget.season;
            targetEpisode = nextTarget.episode;
          }
        }

        if (
          tvId &&
          targetSeason !== undefined &&
          targetEpisode !== undefined &&
          (targetSeason !== currentSeasonRef.current ||
            targetEpisode !== currentEpisodeRef.current)
        ) {
          currentSeasonRef.current = targetSeason;
          currentEpisodeRef.current = targetEpisode;
          setActiveSeason(targetSeason);
          setActiveEpisode(targetEpisode);

          // 1. Dispatch custom event for real-time UI synchronization in EpisodesTab
          window.dispatchEvent(
            new CustomEvent("zeflix:episode-changed", {
              detail: { season: targetSeason, episode: targetEpisode },
            })
          );

          // 2. Update address bar in real-time without unmounting fullscreen iframe
          window.history.replaceState(
            null,
            "",
            `/watch/tv/${tvId}/${targetSeason}/${targetEpisode}`
          );
        }

        // Ended event -> trigger Auto Next ONLY if enabled and a next episode exists
        const eventType = data?.event || data?.data?.event;
        if (eventType === "ended" && autoNext && checkHasNextEpisode()) {
          setCountdown(5);
        }
      } catch {
        // Ignore parsing errors for other message events
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [autoNext, tvId, checkHasNextEpisode, getNextEpisodeTarget]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;

    countdownTimerRef.current = setTimeout(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          const nextTarget = getNextEpisodeTarget();
          if (nextTarget) {
            switchToEpisode(nextTarget.season, nextTarget.episode);
          } else if (nextEpisodeUrl) {
            router.push(nextEpisodeUrl);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, nextEpisodeUrl, router, switchToEpisode, getNextEpisodeTarget]);

  // Handle iframe load — clear the loading state and cancel the safety-net timeout
  const handleIframeLoad = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
  };

  // Handle manual server switch
  const handleServerChange = (url: string) => {
    if (url === selectedServerUrl) return;
    setIsLoading(true);
    setHasError(false);
    setSelectedServerUrl(url);

    // Reset safety-net timeout on every manual server switch
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 8000);
  };

  // Handle retry
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  // Case 1: No source available
  if (!source || !selectedServerUrl) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0e1117] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
        {poster && (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover opacity-20 blur-sm pointer-events-none"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-3 max-w-md">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
            <Play className="w-6 h-6 opacity-40" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Video is currently unavailable.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            We are working to bring this stream online soon. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Next episode details for countdown action
  const nextTarget = getNextEpisodeTarget();
  const hasNext = nextTarget !== null;
  const nextTargetEpisode = nextTarget?.episode || 1;
  const nextTargetSeason = nextTarget?.season || 1;
  const nextDisplayEpisodeNumber = nextTarget
    ? getDisplayEpisodeNumber(nextTarget.season, nextTarget.episode)
    : 1;
  const currentDisplayEpisodeNumber =
    activeSeason && activeEpisode
      ? getDisplayEpisodeNumber(activeSeason, activeEpisode)
      : activeEpisode || 1;

  // Case 2: Source exists (Multi-server player)
  return (
    <div className="w-full space-y-4">
      {/* Playback Container (Attached to containerRef for seamless container-level fullscreen) */}
      <div
        ref={containerRef}
        onMouseMove={handleUserActivity}
        onMouseEnter={handleUserActivity}
        className={`group/player relative w-full bg-black shadow-2xl overflow-hidden ${
          isFullscreen
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
                  S{activeSeason} : E{currentDisplayEpisodeNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {hasNext && nextTarget && (
                <button
                  type="button"
                  onClick={() => switchToEpisode(nextTargetSeason, nextTargetEpisode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg active:scale-95"
                  title={`Next S${nextTargetSeason} E${nextDisplayEpisodeNumber}`}
                >
                  <span>Next S{nextTargetSeason} E{nextDisplayEpisodeNumber}</span>
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

        {/* Sleek Next Episode Button: Visible on mouse hover/activity, automatically hides when idle */}
        {!isFullscreen && hasNext && nextTarget && (
          <div
            className={`absolute bottom-16 right-4 sm:bottom-20 sm:right-6 z-30 transition-all duration-300 ${
              showControlsHud
                ? "opacity-100 pointer-events-auto translate-y-0"
                : "opacity-0 pointer-events-none translate-y-2"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                switchToEpisode(nextTargetSeason, nextTargetEpisode);
              }}
              className="group/next inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#161a23]/95 hover:bg-emerald-500 text-white hover:text-black text-xs sm:text-sm font-bold backdrop-blur-md transition-all cursor-pointer shadow-2xl border border-white/20 hover:border-emerald-400 active:scale-95"
              title={`Next S${nextTargetSeason} E${nextDisplayEpisodeNumber}`}
            >
              <span>Next S{nextTargetSeason} E{nextDisplayEpisodeNumber}</span>
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current transition-transform group-hover/next:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-20 bg-[#0a0c10] flex flex-col items-center justify-center transition-opacity duration-300">
            {poster && (
              <Image
                src={poster}
                alt={title}
                fill
                className="object-cover opacity-20 blur-sm pointer-events-none"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            )}
            <div className="relative z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-spin" />
            </div>
          </div>
        )}

        {/* Auto Next Countdown Overlay (Only when next episode exists) */}
        {countdown !== null && hasNext && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3">
              <FastForward className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-custom1">
              Next S{nextTargetSeason} E{nextDisplayEpisodeNumber} starting in {countdown}s
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
                onClick={() => {
                  if (nextTarget) {
                    switchToEpisode(nextTarget.season, nextTarget.episode);
                  }
                }}
                className="font-custom2 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs sm:text-sm font-bold text-black shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Play S{nextTargetSeason} E{nextDisplayEpisodeNumber}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 z-30 bg-[#0e1117] flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-white">
                Unable to load video on this server.
              </h3>
              <p className="text-xs text-zinc-400">
                Please try switching to another server below or retry.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Transparent Fullscreen Click Catcher positioned directly over the bottom-right [⛶] icon of the player */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className={`absolute z-30 opacity-0 cursor-pointer ${
            isFullscreen
              ? "bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 w-12 h-12"
              : "bottom-1 right-1 sm:bottom-2 sm:right-2 w-10 h-10 sm:w-11 sm:h-11"
          }`}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          aria-label="Fullscreen"
        />

        {/* Playback Iframe / Element */}
        {source.type === "iframe" ? (
          <iframe
            key={`${selectedServerUrl}-${reloadKey}`}
            src={selectedServerUrl}
            title={title}
            className="w-full h-full border-0 relative z-10"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; screen-wake-lock"
            onLoad={handleIframeLoad}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          /* Future-proof Native / HLS player element */
          <video
            key={`${selectedServerUrl}-${reloadKey}`}
            src={selectedServerUrl}
            controls
            className="w-full h-full object-contain relative z-10"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          >
            Your browser does not support HTML5 video streaming.
          </video>
        )}
      </div>

      {/* Control Bar: Multi-Server Selector + Auto Next Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 bg-transparent">
        {/* Server Selection Pills */}
        {servers.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {servers.map((srv) => {
              // Match by provider hostname rather than exact URL so the active
              // indicator stays correct after episode switching (URL changes per episode)
              const getProviderKey = (url: string) => {
                try { return new URL(url).hostname; } catch { return url; }
              };
              const isActive = getProviderKey(srv.url) === getProviderKey(selectedServerUrl);
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handleServerChange(srv.url)}
                  className={`font-custom2 inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                      : "bg-[#161a23] hover:bg-[#202533] text-zinc-300 hover:text-white"
                  }`}
                >
                  <span>{srv.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Action Controls: Auto Next (Only shown when a next episode actually exists) */}
        {tvId && hasNext && (
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => setAutoNext((prev) => !prev)}
              className={`font-custom2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none border ${
                autoNext
                  ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20 hover:bg-emerald-500/25"
                  : "bg-[#161a23] border-zinc-700/80 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
              }`}
              title="Toggle automatic playback for the next episode"
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  autoNext ? "bg-emerald-400" : "bg-zinc-600"
                }`}
              />
              <span>Auto Next</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

