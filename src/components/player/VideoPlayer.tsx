"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import {
  Maximize,
  Minimize,
  FastForward,
  SkipForward,
  X,
} from "lucide-react";
import CircularHeartbeatLoader from "./CircularHeartbeatLoader";
import {
  PlaybackSession,
  PlaybackSource,
  WatchCategory,
} from "@/features/playback/types/playback.types";
import { VideoSource } from "@/infrastructure/video/video.types";
import { EpisodeItem, SeasonItem } from "@/domain/movie/movie.types";
import {
  getSavedProgress,
  savePlaybackProgress,
} from "@/features/playback/service/watch-history.service";
import { requestPlaybackSession } from "@/features/playback/api/playback.api";
import { buildNextEpisodeUrl } from "@/features/playback/service/watch-routing.service";

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
  playbackSession?: PlaybackSession | null;
  source?: VideoSource | null;
  tmdbId?: string;
  movieId?: string;
  imdbId?: string;
  title: string;
  releaseYear?: number;
  type?: "movie" | "tv";
  category?: WatchCategory;
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

type PlaybackLifecycle =
  | "INIT"
  | "PLAYER_LOADING"
  | "PLAYER_LOADED"
  | "PLAYING"
  | "PAUSED"
  | "PLAYBACK_STALLED"
  | "PLAYBACK_ERROR"
  | "ENDED";

export default function VideoPlayer({
  playbackSession: initialSession,
  source: initialSource,
  tmdbId,
  movieId,
  title,
  releaseYear,
  type = "movie",
  category,
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
  // Target media ID
  const effectiveTmdbId = useMemo(() => {
    const clean = (v?: string) => (v && v.trim().length > 0 ? v.trim() : undefined);
    return clean(tmdbId) || clean(tvId) || clean(movieId) || "";
  }, [tmdbId, tvId, movieId]);

  // Session State - Initialized directly from initialSession or initialSource
  const [session, setSession] = useState<PlaybackSession | null>(() => {
    if (initialSession) return initialSession;
    const cleanId = (tmdbId || tvId || movieId || "").trim();
    if (initialSource && cleanId) {
      return {
        mediaInfo: {
          tmdbId: cleanId,
          type,
          title,
          season: currentSeason ?? season ?? 1,
          episode: currentEpisode ?? episode ?? 1,
        },
        sources: [
          {
            type: initialSource.type,
            url: initialSource.url,
            providerId: "initial-source",
            providerName: initialSource.providerName,
          },
        ],
      };
    }
    return null;
  });

  // Provider Fallback Sequence State
  const [sourceIndex, setSourceIndex] = useState<number>(0);
  const [playbackState, setPlaybackState] = useState<PlaybackLifecycle>("INIT");
  const [allProvidersFailed, setAllProvidersFailed] = useState<boolean>(false);
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);

  // Controlled iframe src: starts blank to prevent audio before source is confirmed.
  // Only set to the real URL after a short delay; reset to blank on fallback/source change.
  const [iframeSrc, setIframeSrc] = useState<string>("about:blank");

  // Track prop updates for initialSession
  const [prevInitialSession, setPrevInitialSession] = useState(initialSession);
  if (initialSession !== prevInitialSession) {
    setPrevInitialSession(initialSession);
    setSession(initialSession || null);
    setSourceIndex(0);
    setAllProvidersFailed(false);
    setIsStreamReady(false);
    setIframeSrc("about:blank");
    setPlaybackState("INIT");
  }

  // Active season and episode
  const targetSeason = currentSeason ?? season ?? 1;
  const targetEpisode = currentEpisode ?? episode ?? 1;

  const [activeSeason, setActiveSeason] = useState<number>(targetSeason);
  const [activeEpisode, setActiveEpisode] = useState<number>(targetEpisode);

  const [prevTargetSeason, setPrevTargetSeason] = useState<number>(targetSeason);
  const [prevTargetEpisode, setPrevTargetEpisode] = useState<number>(targetEpisode);

  // Playback Progress States initialized from saved history
  const [currentTime, setCurrentTime] = useState<number>(() => {
    const clean = (tmdbId || tvId || movieId || "").trim();
    if (!clean) return 0;
    const s = currentSeason ?? season ?? 1;
    const ep = currentEpisode ?? episode ?? 1;
    return getSavedProgress(type, clean, type === "tv" ? s : undefined, type === "tv" ? ep : undefined);
  });
  const [duration, setDuration] = useState<number>(0);

  // Sync active season and episode when props change via route navigation
  if (targetSeason !== prevTargetSeason || targetEpisode !== prevTargetEpisode) {
    setPrevTargetSeason(targetSeason);
    setPrevTargetEpisode(targetEpisode);
    setActiveSeason(targetSeason);
    setActiveEpisode(targetEpisode);
    setSourceIndex(0);
    setAllProvidersFailed(false);
    setIsStreamReady(false);
    setIframeSrc("about:blank");
    setPlaybackState("INIT");
    setCurrentTime(0);
  }

  // UI Overlays & Timers
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Fullscreen Controls Auto-Hide State
  const [isFullscreenTopBarVisible, setIsFullscreenTopBarVisible] = useState<boolean>(true);
  const [isWakeSensorActive, setIsWakeSensorActive] = useState<boolean>(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseOverTopBarRef = useRef<boolean>(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gracePeriodTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playbackConfirmedRef = useRef<boolean>(false);
  const lastCurrentTimeRef = useRef<number>(0);

  // If no session passed initially and no initialSource, dynamically fetch it asynchronously
  useEffect(() => {
    if (!session && effectiveTmdbId && !initialSource) {
      requestPlaybackSession({
        type,
        tmdbId: effectiveTmdbId,
        season: type === "tv" ? activeSeason : undefined,
        episode: type === "tv" ? activeEpisode : undefined,
        title,
        category,
      })
        .then((newSession) => {
          setSession(newSession);
          setSourceIndex(0);
          setAllProvidersFailed(false);
        })
        .catch((err) => {
          console.error("[VideoPlayer] Failed to load session:", err);
          setAllProvidersFailed(true);
        });
    }
  }, [session, effectiveTmdbId, initialSource, type, activeSeason, activeEpisode, title, category]);

  // Provider Abstraction: Playback sources received generically from PlaybackService session
  const playableSources = useMemo(() => {
    return session?.sources ?? [];
  }, [session]);

  // Current active source in priority sequence
  const currentSource: PlaybackSource | null = useMemo(() => {
    if (playableSources.length === 0) {
      return null;
    }
    return playableSources[sourceIndex] || playableSources[0] || null;
  }, [playableSources, sourceIndex]);

  // Periodic watch progress sync
  useEffect(() => {
    if (!effectiveTmdbId || currentTime <= 0) return;
    savePlaybackProgress(
      type,
      effectiveTmdbId,
      currentTime,
      duration,
      type === "tv" ? activeSeason : undefined,
      type === "tv" ? activeEpisode : undefined
    );
  }, [currentTime, duration, effectiveTmdbId, type, activeSeason, activeEpisode]);

  /**
   * Centralized Automatic Provider Fallback Transition
   * Triggered when:
   * 1. Grace period expires without playback confirmation
   * 2. Fatal player/media error is reported
   * 3. Connection timed out before player loaded
   * 4. Playback stalled indefinitely
   */
  const triggerProviderFallback = useCallback(
    (reason: string) => {
      if (gracePeriodTimerRef.current) {
        clearTimeout(gracePeriodTimerRef.current);
        gracePeriodTimerRef.current = null;
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      if (stallTimeoutRef.current) {
        clearTimeout(stallTimeoutRef.current);
        stallTimeoutRef.current = null;
      }

      playbackConfirmedRef.current = false;

      const totalSources = playableSources.length;
      const nextIndex = sourceIndex + 1;

      console.warn(
        `[VideoPlayer] Source '${currentSource?.providerName || currentSource?.providerId || "unknown"}' failed (${reason}). ` +
        `Advancing to next fallback (${nextIndex + 1}/${totalSources}).`
      );
      // Note: nextIndex is the 0-based index of the next source; (nextIndex+1) shows which source we're switching TO

      if (nextIndex < totalSources) {
        setSourceIndex(nextIndex);
        setIsStreamReady(false);
        setPlaybackState("PLAYER_LOADING");
      } else {
        // All providers in the cascade exhausted
        setAllProvidersFailed(true);
        setIsStreamReady(false);
        setPlaybackState("PLAYBACK_ERROR");
      }
    },
    [playableSources, sourceIndex, currentSource]
  );

  // Fullscreen Controls Auto-Hide Manager with Continuous Movement Probing
  // Declared before confirmPlayback because confirmPlayback calls it on playback start.
  const showFullscreenControls = useCallback(() => {
    setIsFullscreenTopBarVisible(true);
    setIsWakeSensorActive(false);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }

    // Auto-hide controls after 3.5s of inactivity, unless mouse is hovering over top bar
    if (!isMouseOverTopBarRef.current) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isMouseOverTopBarRef.current) return;
        // Hide controls — sensor (z-[999998]) becomes pointer-events-auto to catch next movement
        setIsFullscreenTopBarVisible(false);
        setIsWakeSensorActive(true);
        try { window.focus(); } catch { }
      }, 3500);
    }
  }, []);

  /**
   * Playback Health Confirmation:
   * Confirms that video has actually started rendering and advancing time.
   * Also re-shows fullscreen controls so the user can interact with the new
   * episode — critical on mobile where touch events into the iframe don't
   * bubble to window, making the wake sensor unable to detect taps.
   */
  const confirmPlayback = useCallback(() => {
    if (playbackConfirmedRef.current) return;
    playbackConfirmedRef.current = true;

    if (gracePeriodTimerRef.current) {
      clearTimeout(gracePeriodTimerRef.current);
      gracePeriodTimerRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (stallTimeoutRef.current) {
      clearTimeout(stallTimeoutRef.current);
      stallTimeoutRef.current = null;
    }

    setIsStreamReady(true);
    setPlaybackState("PLAYING");

    // Re-show fullscreen controls when new episode starts playing.
    // Without this, controls stay hidden after an episode switch because:
    // the iframe steals touch events on mobile, so window touchstart
    // never fires and the wake sensor can't bring controls back.
    showFullscreenControls();
  }, [showFullscreenControls]);

  // Handle iframe load event
  const handleIframeLoad = useCallback(() => {
    // Ignore load events from the silent placeholder page (about:blank).
    // The real load event will fire once the actual source URL is set.
    if (!iframeRef.current || iframeRef.current.src === "about:blank") return;

    setPlaybackState("PLAYER_LOADED");

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    // Providers that embed a webpage player but do NOT send postMessage events.
    // For these, auto-confirm playback once the iframe has loaded successfully,
    // after a short buffer for the player UI to initialize.
    //
    // Auto-confirm providers (webpage embeds, no postMessage):
    //   - vidlink, superembed: main embed players
    //   - tokufun, tokuaddon, tokustream: webpage-based Sentai embed players
    //
    // Requires postMessage confirmation:
    //   - yenime: anime player that may send postMessage events
    const providerId = currentSource?.providerId || "";
    const isAutoConfirmProvider =
      providerId === "vidlink" ||
      providerId === "superembed" ||
      providerId === "tokufun" ||
      providerId === "tokuaddon" ||
      providerId === "tokustream" ||
      (!providerId && !currentSource?.providerName);

    if (isAutoConfirmProvider) {
      // Short buffer for player UI to render before we mark playback as confirmed
      gracePeriodTimerRef.current = setTimeout(() => {
        if (!playbackConfirmedRef.current) {
          confirmPlayback();
        }
      }, 3000);
      return;
    }

    // For specialized providers: wait for actual postMessage confirmation
    // Grace period extended to 20s for slow-loading providers
    if (gracePeriodTimerRef.current) {
      clearTimeout(gracePeriodTimerRef.current);
    }

    gracePeriodTimerRef.current = setTimeout(() => {
      if (!playbackConfirmedRef.current) {
        triggerProviderFallback("Playback did not start within grace period timeout");
      }
    }, 20000);
  }, [triggerProviderFallback, confirmPlayback, currentSource]);

  // Source change effect: reset states and initiate initial connection monitoring
  useEffect(() => {
    if (!currentSource) return;

    playbackConfirmedRef.current = false;
    lastCurrentTimeRef.current = 0;

    // Immediately silence the iframe by resetting src to blank.
    // This prevents audio bleed-through from the previous (failing) source
    // while the new source is being loaded.
    setIframeSrc("about:blank");
    setIsStreamReady(false);
    setPlaybackState("PLAYER_LOADING");

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    if (gracePeriodTimerRef.current) {
      clearTimeout(gracePeriodTimerRef.current);
    }
    if (stallTimeoutRef.current) {
      clearTimeout(stallTimeoutRef.current);
    }

    // Short delay before setting the real src so the blank page has time to render
    // (prevents the new source from starting audio before overlay is shown)
    const srcRevealTimer = setTimeout(() => {
      setIframeSrc(currentSource.url);
    }, 150);

    // Initial connection timeout: if stream source fails to connect / load before timeout
    // 25s gives enough time for slow-loading third-party embed providers
    connectionTimeoutRef.current = setTimeout(() => {
      if (!playbackConfirmedRef.current) {
        triggerProviderFallback("Connection timed out before player loaded");
      }
    }, 25000);

    return () => {
      clearTimeout(srcRevealTimer);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (gracePeriodTimerRef.current) {
        clearTimeout(gracePeriodTimerRef.current);
      }
      if (stallTimeoutRef.current) {
        clearTimeout(stallTimeoutRef.current);
      }
    };
  }, [currentSource, triggerProviderFallback]);

  // Listen for playback events via window.postMessage to verify actual playback health
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      let rawData = event.data;
      if (typeof rawData === "string") {
        try {
          rawData = JSON.parse(rawData);
        } catch {
          // May be plain string event like "play" or "timeupdate"
        }
      }

      const eventName = (
        typeof rawData === "string"
          ? rawData
          : rawData?.event || rawData?.type || rawData?.action || ""
      ).toLowerCase();

      // Show fullscreen controls ONLY for explicit user-interaction events.
      // DO NOT call showFullscreenControls() for passive playback state events
      // like timeupdate/progress — these fire every ~1s during playback and would
      // constantly reset the auto-hide timer, keeping controls permanently visible.
      if (isFullscreen) {
        const isUserInteractionEvent =
          eventName === "play" ||
          eventName === "playing" ||
          eventName === "player_play" ||
          eventName === "pause" ||
          eventName === "player_pause" ||
          eventName === "seek" ||
          eventName === "seeked" ||
          eventName === "player_seek" ||
          eventName === "click" ||
          eventName === "fullscreen" ||
          eventName === "fullscreen_change" ||
          eventName === "ended" ||
          eventName === "media_ended" ||
          eventName === "player_ended" ||
          eventName === "error" ||
          eventName === "player_error";

        if (isUserInteractionEvent) {
          showFullscreenControls();
        }
      }

      // 1. Play event: Actual playback confirmed
      if (
        eventName === "play" ||
        eventName === "playing" ||
        eventName === "player_play" ||
        eventName === "playback_started" ||
        eventName === "video_playing"
      ) {
        confirmPlayback();
      }

      // 2. Pause event
      if (eventName === "pause" || eventName === "player_pause") {
        confirmPlayback();
        setPlaybackState("PAUSED");
      }

      // 3. Time Update & Media Progress
      if (
        eventName === "timeupdate" ||
        eventName === "media_data" ||
        eventName === "player_loaded" ||
        eventName === "ready" ||
        eventName === "canplay" ||
        eventName === "video:progress"
      ) {
        const cur = rawData?.currentTime ?? rawData?.data?.currentTime;
        const dur = rawData?.duration ?? rawData?.data?.duration;

        if (typeof cur === "number" && !isNaN(cur)) {
          setCurrentTime(cur);
          if (cur > 0 || cur > lastCurrentTimeRef.current) {
            confirmPlayback();
            lastCurrentTimeRef.current = cur;
          }
        } else if (eventName === "canplay" || eventName === "ready") {
          confirmPlayback();
        }

        if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
          setDuration(dur);
        }
      }

      // 4. Video Ended
      if (
        eventName === "ended" ||
        eventName === "media_ended" ||
        eventName === "player_ended"
      ) {
        setPlaybackState("ENDED");
      }

      // 5. Fatal Playback Error from provider
      if (
        eventName === "error" ||
        eventName === "player_error" ||
        eventName === "media_error" ||
        eventName === "video_error" ||
        eventName === "media_unavailable" ||
        eventName === "cant_play" ||
        eventName === "playback_error"
      ) {
        triggerProviderFallback("Explicit error event reported by player");
      }

      // 6. Stalled playback monitoring
      if (eventName === "stalled" || eventName === "waiting") {
        if (!stallTimeoutRef.current && playbackConfirmedRef.current) {
          stallTimeoutRef.current = setTimeout(() => {
            triggerProviderFallback("Playback stalled indefinitely");
          }, 8000);
        }
      }
    };

    window.addEventListener("message", handleWindowMessage);
    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [type, isFullscreen, showFullscreenControls, confirmPlayback, triggerProviderFallback]);

  // Fullscreen Activity Listeners (Mouse move, Touch, Window blur / Iframe clicks)
  useEffect(() => {
    if (!isFullscreen) {
      const resetBarTimer = setTimeout(() => {
        setIsFullscreenTopBarVisible(true);
        setIsWakeSensorActive(false);
      }, 0);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
      return () => {
        clearTimeout(resetBarTimer);
      };
    }

    // Immediately show controls when entering fullscreen
    const enterFullscreenTimer = setTimeout(() => {
      showFullscreenControls();
    }, 0);

    const handleActivity = () => {
      showFullscreenControls();
    };

    const handleWindowBlur = () => {
      // User tapped or clicked into iframe (player controls or video canvas)
      showFullscreenControls();
    };

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("pointermove", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("touchmove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      clearTimeout(enterFullscreenTimer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("pointermove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("touchmove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("blur", handleWindowBlur);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, [isFullscreen, showFullscreenControls]);

  // Fullscreen Management
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current as VendorFullscreenElement;
    const doc = document as VendorFullscreenDocument;

    if (
      !doc.fullscreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.msFullscreenElement
    ) {
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

  // Keyboard shortcut 'F' & fullscreen change listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as VendorFullscreenDocument;
      const fullElem =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      const ourContainer = containerRef.current;

      if (!fullElem) {
        // Nothing is fullscreen — exit our custom fullscreen
        setIsFullscreen(false);
        return;
      }

      // Something is fullscreen. Only update our state if it's directly our container.
      if (ourContainer && fullElem === ourContainer) {
        // Our container is the fullscreen element — entering our custom fullscreen
        setIsFullscreen(true);
        showFullscreenControls();
      } else if (ourContainer && ourContainer.contains(fullElem)) {
        // The embedded iframe went fullscreen natively (e.g. VidLink's own fullscreen button).
        // Sync our state so the auxiliary bar button correctly shows "Exit Fullscreen".
        setIsFullscreen(true);
      } else {
        // Something unrelated to our player is fullscreen
        setIsFullscreen(false);
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
  }, [toggleFullscreen, showFullscreenControls]);

  // Calculate Next Episode Target
  const nextTarget = useMemo((): { season: number; episode: number } | null => {
    if (type !== "tv") return null;

    if (seasons && seasons.length > 0) {
      const currentSeasonObj = seasons.find(
        (item) => Number(item.seasonNumber) === Number(activeSeason)
      );
      const maxEpisodes =
        currentSeasonObj?.episodeCount || episodes?.length || 0;

      if (activeEpisode < maxEpisodes) {
        return { season: activeSeason, episode: activeEpisode + 1 };
      }

      const nextSeasonObj = seasons.find(
        (item) => Number(item.seasonNumber) === Number(activeSeason) + 1
      );
      if (nextSeasonObj && nextSeasonObj.episodeCount > 0) {
        return { season: activeSeason + 1, episode: 1 };
      }
      return null;
    }

    if (nextEpisodeUrl) {
      // Handles new category URL: /watch/tv/[category]/[id]/[episode]
      const catMatch = nextEpisodeUrl.match(/\/watch\/tv\/(?:anime|sentai|normal)\/[^/]+\/(\d+)/);
      if (catMatch) {
        return {
          season: activeSeason || 1,
          episode: parseInt(catMatch[1], 10),
        };
      }

      // Handles legacy URL: /watch/tv/[id]/[season]/[episode]
      const legacyMatch = nextEpisodeUrl.match(/\/watch\/tv\/[^/]+\/(\d+)\/(\d+)/);
      if (legacyMatch) {
        return {
          season: parseInt(legacyMatch[1], 10),
          episode: parseInt(legacyMatch[2], 10),
        };
      }
    }
    return null;
  }, [type, seasons, episodes, activeSeason, activeEpisode, nextEpisodeUrl]);

  // Seamless in-place episode switcher
  const switchToEpisode = useCallback(
    async (newSeason: number, newEpisode: number) => {
      if (!effectiveTmdbId) return;

      setActiveSeason(newSeason);
      setActiveEpisode(newEpisode);
      setCountdown(null);
      setAllProvidersFailed(false);
      setIsStreamReady(false);
      setPlaybackState("PLAYER_LOADING");
      setCurrentTime(0);
      setDuration(0);

      // Show fullscreen controls immediately while the new episode loads.
      // This gives mobile users visual feedback that the switch happened
      // and ensures controls are accessible during the loading state.
      showFullscreenControls();

      window.dispatchEvent(
        new CustomEvent("zeflix:episode-changed", {
          detail: { season: newSeason, episode: newEpisode },
        })
      );

      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const effectiveCategory: WatchCategory =
        category ||
        (path.includes("/anime/")
          ? "anime"
          : path.includes("/sentai/")
          ? "sentai"
          : "normal");
      const newUrl = buildNextEpisodeUrl(
        effectiveCategory,
        effectiveTmdbId,
        newEpisode,
        newSeason
      );

      window.history.replaceState(null, "", newUrl);

      try {
        const freshSession = await requestPlaybackSession({
          type: "tv",
          tmdbId: effectiveTmdbId,
          season: newSeason,
          episode: newEpisode,
          title,
          category: effectiveCategory,
        });
        setSession(freshSession);
        setSourceIndex(0);
      } catch (err) {
        console.error("[VideoPlayer] Failed to load next episode session:", err);
        setAllProvidersFailed(true);
      }
    },
    [effectiveTmdbId, title, category, showFullscreenControls]
  );

  // Retry playback resolution when error occurs
  const handleRetry = useCallback(async () => {
    setAllProvidersFailed(false);
    setSourceIndex(0);
    setIsStreamReady(false);
    setPlaybackState("PLAYER_LOADING");
    playbackConfirmedRef.current = false;
    lastCurrentTimeRef.current = 0;

    if (effectiveTmdbId) {
      try {
        const freshSession = await requestPlaybackSession({
          type,
          tmdbId: effectiveTmdbId,
          season: type === "tv" ? activeSeason : undefined,
          episode: type === "tv" ? activeEpisode : undefined,
          title,
          category,
        });
        setSession(freshSession);
      } catch (err) {
        console.error("[VideoPlayer] Retry resolution failed:", err);
        setAllProvidersFailed(true);
      }
    }
  }, [effectiveTmdbId, type, activeSeason, activeEpisode, title, category]);

  // Listen for remote episode switch events (e.g. from EpisodesTab)
  useEffect(() => {
    const handleRemoteChangeEpisode = (e: Event) => {
      const customEvent = e as CustomEvent<{ season: number; episode: number }>;
      if (!customEvent.detail) return;
      const { season: s, episode: ep } = customEvent.detail;
      switchToEpisode(Number(s), Number(ep));
    };

    window.addEventListener("zeflix:change-episode", handleRemoteChangeEpisode);
    return () => {
      window.removeEventListener("zeflix:change-episode", handleRemoteChangeEpisode);
    };
  }, [switchToEpisode]);

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

  /**
   * Format Player Media Information:
   * Displays: `Title (Year)` matching movies & TV series
   */
  const formattedMediaInfoText = useMemo(() => {
    const rawTitle = title || session?.mediaInfo.title || "Zeflix Stream";
    const yearStr = releaseYear ? ` (${releaseYear})` : "";
    return `${rawTitle}${yearStr}`;
  }, [title, session, releaseYear]);

  return (
    <div className="w-full space-y-4 select-none">
      {/* Outer Video Player Shell */}
      <div
        ref={containerRef}
        data-playback-state={playbackState}
        className={`group/player relative w-full bg-black shadow-2xl overflow-hidden ${isFullscreen
          ? `fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center rounded-none ${isFullscreenTopBarVisible ? "cursor-default" : "cursor-none"}`
          : "aspect-video rounded-2xl"
          }`}
      >
        {/* Stream Iframe Player - Clean embedded player */}
        {/* iframeSrc is controlled: starts as about:blank (silent) and is set to the real URL
            after a short delay. On fallback, it's immediately reset to blank to cut audio.
            The key is tied to the source URL so the iframe remounts on source change. */}
        {currentSource && !allProvidersFailed && (
          <iframe
            ref={iframeRef}
            key={`${currentSource.providerId}-${currentSource.url}`}
            src={iframeSrc}
            title={formattedMediaInfoText}
            className="w-full h-full border-0 absolute inset-0 z-10"
            allow="accelerometer *; autoplay *; clipboard-write; encrypted-media *; gyroscope *; picture-in-picture *; web-share *; fullscreen *"
            allowFullScreen
            referrerPolicy="origin"
            onLoad={handleIframeLoad}
            onError={() =>
              triggerProviderFallback("Iframe failed to load or connection error")
            }
          />
        )}

        {/* Cinematic Loading Overlay */}
        {!isStreamReady && !allProvidersFailed && (
          <div className="absolute inset-0 z-30 bg-[#06080c] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            {poster && (
              <Image
                src={poster}
                alt={title}
                fill
                priority
                className="object-cover opacity-20 blur-md scale-105 pointer-events-none"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            )}
            <div className="absolute inset-0 bg-radial from-transparent via-[#06080c]/80 to-[#06080c] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-center">
              <CircularHeartbeatLoader />
            </div>
          </div>
        )}

        {/* Error Overlay: 1 single clean line of text without any icon or custom font */}
        {allProvidersFailed && (
          <div
            onClick={handleRetry}
            className="absolute inset-0 z-40 bg-[#06080c] flex items-center justify-center p-6 text-center animate-in fade-in cursor-pointer"
            title="Click to retry"
          >
            <p className="text-white text-sm sm:text-base font-normal">
              We couldn&apos;t play this video right now. Please try again later.
            </p>
          </div>
        )}

        {/* Auto Next Countdown Overlay for TV Series */}
        {countdown !== null && nextTarget && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center mb-3">
              <FastForward className="w-7 h-7 text-sky-400 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              Next S{String(nextTarget.season).padStart(2, "0")} E{String(nextTarget.episode).padStart(2, "0")} starting in {countdown}s
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-5">
              Auto Next is enabled
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCountdown(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-zinc-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={() => switchToEpisode(nextTarget.season, nextTarget.episode)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FULLSCREEN OVERLAYS (Only visible when isFullscreen === true)              */}
        {/* ========================================================================= */}
        {isFullscreen && (
          <>
            {/* Full-screen interaction sensor:
              - Active (pointer-events-auto) ONLY when controls are fully hidden, to catch
                the next mouse move / tap and bring controls back.
              - During probe (isWakeSensorActive while controls still visible): sensor must
                NOT intercept pointer events so clicks reach actual buttons (Minimize, Next).
              - Cursor is hidden only when controls are hidden so user can see where to click
                while controls are visible.
            */}
            <div
              className={`fixed inset-0 z-[999998] transition-opacity duration-200 ${
                !isFullscreenTopBarVisible
                  ? "pointer-events-auto cursor-none bg-transparent"
                  : "pointer-events-none"
              }`}
              onMouseMove={showFullscreenControls}
              onTouchStart={showFullscreenControls}
              onClick={showFullscreenControls}
            />

            {/* Fullscreen Floating Top Bar: Title, Next Episode & Exit Fullscreen - Auto-hides on inactivity */}
            <div
              onMouseEnter={() => {
                isMouseOverTopBarRef.current = true;
                if (controlsTimeoutRef.current) {
                  clearTimeout(controlsTimeoutRef.current);
                  controlsTimeoutRef.current = null;
                }
                setIsFullscreenTopBarVisible(true);
                setIsWakeSensorActive(false);
              }}
              onMouseLeave={() => {
                isMouseOverTopBarRef.current = false;
                showFullscreenControls();
              }}
              onTouchStart={() => {
                showFullscreenControls();
              }}
              className={`fixed top-0 inset-x-0 z-[999999] p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-all duration-300 ease-in-out ${
                isFullscreenTopBarVisible
                  ? "opacity-100 pointer-events-auto translate-y-0"
                  : "opacity-0 pointer-events-none -translate-y-2"
              }`}
            >
              <span className="text-white font-bold text-sm sm:text-base tracking-wide drop-shadow-md truncate max-w-xs sm:max-w-md md:max-w-lg">
                {formattedMediaInfoText}
              </span>

              <div className="flex items-center gap-2.5">
                {nextTarget && !allProvidersFailed && (
                  <button
                    type="button"
                    onClick={() => switchToEpisode(nextTarget.season, nextTarget.episode)}
                    className="group/next inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg active:scale-95 border border-sky-400/30"
                    title={`Next S${String(nextTarget.season).padStart(2, "0")} E${String(nextTarget.episode).padStart(2, "0")}`}
                  >
                    <span>S{String(nextTarget.season).padStart(2, "0")} E{String(nextTarget.episode).padStart(2, "0")}</span>
                    <SkipForward className="w-3.5 h-3.5 fill-current transition-transform group-hover/next:translate-x-0.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition cursor-pointer active:scale-95"
                  title="Exit Fullscreen (Esc / F)"
                >
                  <Minimize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Hotspot in bottom-right corner to capture fullscreen toggle directly on containerRef (only when not fullscreen) */}
        {!isFullscreen && (
          <div
            onClick={toggleFullscreen}
            className="absolute bottom-0 right-0 w-12 h-12 z-20 cursor-pointer pointer-events-auto"
            title="Fullscreen (F)"
          />
        )}
      </div>

      {/* Auxiliary bar below video player: Dedicated Fullscreen Trigger */}
      {/* Hidden in fullscreen — the top bar overlay already provides Minimize button */}
      {!isFullscreen && (
        <div className="flex items-center justify-end gap-2.5 pt-1">

          {/* Fullscreen Button below player */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161a23] border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            title="Fullscreen (F)"
          >
            <Maximize className="w-3.5 h-3.5 text-white" />
            <span>Fullscreen</span>
          </button>
        </div>
      )}
    </div>
  );
}
