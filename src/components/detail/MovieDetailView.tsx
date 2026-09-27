"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Play,
  CirclePlay,
  Bookmark,
  Star,
  Share2,
  Tv,
} from "lucide-react";
import toast from "react-hot-toast";
import { MovieDetail } from "@/domain/movie/movie.types";
import BackButton from "@/components/BackButton";
import CastSection from "./CastSection";
import ReviewsTab from "./ReviewsTab";
import SimilarContentSection from "./SimilarContentSection";
import TrailerModal from "./TrailerModal";
import DetailSkeletonLoading from "./DetailSkeletonLoading";
import {
  requestCheckWatchlistStatus,
  requestToggleWatchlist,
} from "@/features/watchlist/api/watchlist.api";
import { requestGetProgress } from "@/features/watch-history/api/watch-history.api";
import {
  getSavedProgress,
  clearSavedProgress,
} from "@/features/playback/service/watch-history.service";
import { useAuthStore } from "@/store/auth.store";
import { useAuthModalStore } from "@/store/auth-modal.store";
import {
  determineWatchCategory,
  buildWatchUrl,
} from "@/features/playback/service/watch-routing.service";
import { getDisplayCountry } from "@/libs/country";

interface MovieDetailViewProps {
  movie: MovieDetail;
}

export default function MovieDetailView({ movie }: MovieDetailViewProps) {
  const router = useRouter();
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
  const [isWatchlist, setIsWatchlist] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const countryDisplay = useMemo(
    () =>
      getDisplayCountry({
        originCountry: movie.originCountry,
        productionCountries: movie.productionCountries,
        originalLanguage: movie.originalLanguage,
      }),
    [movie.originCountry, movie.productionCountries, movie.originalLanguage]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [movie.id]);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      const userId = useAuthStore.getState().user_id;
      if (!userId) {
        setIsWatchlist(false);
        return;
      }

      try {
        const tmdbId = parseInt(movie.id, 10);
        if (!isNaN(tmdbId)) {
          const res = await requestCheckWatchlistStatus(tmdbId, "movie");
          if (isMounted && res.success) {
            setIsWatchlist(res.isAdded);
          }
        }
      } catch {
        // Not logged in or error, keep false
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [movie.id]);

  const [hasWatched, setHasWatched] = useState<boolean>(false);
  const [savedProgressSeconds, setSavedProgressSeconds] = useState<number>(0);
  const [isCheckingProgress, setIsCheckingProgress] = useState<boolean>(true);

  useEffect(() => {
    setIsCheckingProgress(true);
    let isMounted = true;
    const tmdbId = parseInt(movie.id, 10);
    if (isNaN(tmdbId)) {
      setIsCheckingProgress(false);
      return;
    }

    // Safety timeout to avoid hanging skeleton if network is stalled
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsCheckingProgress(false);
      }
    }, 3000);

    // Fast check from localStorage
    const localProgress = getSavedProgress("movie", movie.id);
    if (localProgress > 0) {
      setHasWatched(true);
      setSavedProgressSeconds(localProgress);
    }

    // Authoritative check from Supabase watch_history
    requestGetProgress("movie", tmdbId)
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data && (res.data.progress_seconds > 0 || res.data.completed)) {
            setHasWatched(true);
            setSavedProgressSeconds(res.data.progress_seconds || 0);
          } else if (res.success && !res.data) {
            setHasWatched(false);
            setSavedProgressSeconds(0);
            clearSavedProgress("movie", movie.id);
          }
        }
      })
      .catch(() => { })
      .finally(() => {
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsCheckingProgress(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [movie.id]);

  const handleWatchNow = () => {
    const category = determineWatchCategory({
      tmdbId: String(movie.id),
      title: movie.title,
      genres: movie.genres,
      originCountry: movie.productionCountries,
      productionCountries: movie.productionCountries,
      originalLanguage: movie.originalLanguage,
      mediaType: "movie",
    });
    const saved = savedProgressSeconds || getSavedProgress("movie", movie.id);
    const startQuery = saved > 0 ? `?start=${Math.floor(saved)}` : "";
    router.push(`${buildWatchUrl({ type: "movie", tmdbId: movie.id, category })}${startQuery}`);
  };

  const toggleWatchlist = async () => {
    if (isToggling) return;
    const userId = useAuthStore.getState().user_id;
    if (!userId) {
      useAuthModalStore.getState().openModal({
        title: "Sign in to use Watchlist",
        description: `Please sign in or register an account to add "${movie.title}" to your watchlist.`,
      });
      return;
    }

    const tmdbId = parseInt(movie.id, 10);
    if (isNaN(tmdbId)) return;

    const nextState = !isWatchlist;
    setIsWatchlist(nextState);
    setIsToggling(true);

    try {
      const res = await requestToggleWatchlist({
        tmdb_id: tmdbId,
        type: "movie",
        title: movie.title,
        poster_path: movie.poster,
        backdrop_path: movie.backdrop,
        vote_average: parseFloat(movie.rating) || 0,
        release_date: movie.year,
        overview: movie.description,
        action: nextState ? "add" : "remove",
      });

      if (res.success) {
        setIsWatchlist(res.data.isAdded);
      }
    } catch (err: unknown) {
      // Revert state on failure
      setIsWatchlist(!nextState);
      const msg = err instanceof Error ? err.message : "Failed to update watchlist";
      toast.error(msg, {
        id: `fav-err-${movie.id}`,
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        id: "share-link",
        icon: "🔗",
        duration: 2000,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    }
  };



  if (isCheckingProgress) {
    return <DetailSkeletonLoading />;
  }

  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-white pb-24 preserve-dark"
      data-preserve-dark="true"
    >
      {/* Hero Backdrop Section */}
      <div className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col">
        {/* Full-width Background Image */}
        <div className="absolute inset-0 z-0">
          {movie.backdrop ? (
            <Image
              src={movie.backdrop}
              alt={movie.title}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-[#0d1017]" />
          )}

          {/* Cinematic Vignette & Gradients Overlay (Aligned with HeroSlider) */}
          {/* Left text-protection gradient: soft shadow on PC, minimal on mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent lg:w-[55%] lg:from-black/55 lg:via-black/20 lg:to-transparent z-10 pointer-events-none" />
          {/* Bottom fade gradient: smooth seamless fade to page, non-intrusive */}
          <div className="absolute inset-x-0 bottom-0 h-48 sm:h-64 lg:h-72 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
          {/* Top header fade: subtle navbar area fade */}
          <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-black/50 via-black/15 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 flex-1 flex flex-col justify-between gap-8">
          {/* Top Bar: Back Button */}
          <div className="flex items-center">
            <BackButton
              fallbackUrl="/"
              className="font-custom1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer backdrop-blur-md shadow-lg"
            />
          </div>

          {/* Bottom Hero Info: Title, Metadata, Actions */}
          <div className="space-y-6">
            {/* Title & Metadata (Left Aligned, max-w-3xl) */}
            <div className="max-w-3xl space-y-3.5 sm:space-y-4">
              {/* Tag Badge */}
              {movie.tagline && (
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs sm:text-[13px] font-custom2 tracking-wide shadow-sm">
                  <span>{movie.tagline}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                {movie.title}
              </h1>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium text-zinc-300">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{movie.rating}</span>
                </div>

                {movie.year && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>{movie.year}</span>
                  </>
                )}

                {movie.duration && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>{movie.duration}</span>
                  </>
                )}

                {countryDisplay && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>{countryDisplay}</span>
                  </>
                )}

                {movie.genres && movie.genres.length > 0 && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      {movie.genres.map((genre, idx) => (
                        <React.Fragment key={genre}>
                          {idx > 0 && <span className="text-zinc-600">,</span>}
                          <span>{genre}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}

                {movie.certificate && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[11px] font-semibold">
                      {movie.certificate}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons Row (Responsive: Stacked rows on mobile, Left-Right on desktop) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pt-1 w-full">
              {/* Left Action Buttons (Row 1 on mobile: Watch Now & Add Watchlist) */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                {/* Watch Now / Continue Button */}
                {!(
                  movie.isUpcoming ??
                  (Boolean(movie.releaseDate && movie.releaseDate > new Date().toISOString().split("T")[0]) ||
                    Boolean(movie.status && movie.status.toLowerCase() !== "released"))
                ) && (
                    <button
                      type="button"
                      onClick={handleWatchNow}
                      className="flex-1 sm:flex-initial h-11 sm:h-12 min-w-[140px] sm:min-w-[160px] inline-flex items-center justify-center gap-2 px-5 sm:px-8 rounded-xl bg-[#2ca566] hover:bg-emerald-500 active:scale-95 text-white font-custom1 text-sm sm:text-base font-bold tracking-wide transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
                    >
                      {hasWatched ? (
                        <>
                          <CirclePlay className="w-4 sm:w-5 h-4 sm:h-5 fill-white/20 stroke-[2.2] shrink-0" />
                          <span>Continue</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white shrink-0" />
                          <span>Play Now</span>
                        </>
                      )}
                    </button>
                  )}

                {/* Watchlist Bookmark Button */}
                <button
                  type="button"
                  onClick={toggleWatchlist}
                  className="flex-1 sm:flex-initial h-11 sm:h-12 min-w-[150px] sm:min-w-[170px] inline-flex items-center justify-center gap-2 px-4 sm:px-6 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-white font-custom1 text-sm sm:text-base font-semibold border border-white/10 transition-all cursor-pointer group/fav"
                >
                  {isWatchlist ? (
                    <>
                      <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400 stroke-yellow-400 scale-110 shrink-0 transition-transform" />
                      <span className="truncate">Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2] text-white group-hover/fav:text-yellow-400 group-hover/fav:scale-110 shrink-0 transition-all" />
                      <span className="truncate">Watchlist</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Action Buttons (Row 2 on mobile: Trailer, Copy Link horizontally balanced) */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-start md:justify-end md:ml-auto">
                {/* Watch Trailer Button */}
                {movie.trailerId && (
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="flex-1 md:flex-initial h-11 sm:h-12 inline-flex items-center justify-center gap-2 px-4 sm:px-5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-custom1 text-sm sm:text-base font-semibold backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-md"
                  >
                    <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Trailer</span>
                  </button>
                )}



                {/* Share / Copy Link Quick Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-11 sm:w-12 h-11 sm:h-12 inline-flex items-center justify-center rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-md shrink-0"
                  title="Copy Link / Share"
                  aria-label="Copy Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 mt-2">
        {/* Story Line */}
        <div className="space-y-2.5 max-w-4xl">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide font-custom2">
            Story Line
          </h2>
          <p className="text-zinc-300/90 text-sm sm:text-base leading-relaxed">
            {movie.description || "No overview available for this movie."}
          </p>
        </div>

        {/* Top Cast Section */}
        <CastSection cast={movie.cast} />

        {/* Navigation Tabs: Movie only has Reviews (No Episodes, No News, No Universe) */}
        <div className="w-full border-b border-white/10 pb-1">
          <div className="flex items-center gap-8 font-custom2">
            <button
              type="button"
              className="relative pb-3 text-sm sm:text-base font-bold font-custom2 text-white tracking-wide transition-colors cursor-pointer"
            >
              <span>Reviews</span>
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Reviews Tab Content */}
        <ReviewsTab reviews={movie.reviews} averageRating={movie.rating} />

        {/* Similar Movies For You */}
        <SimilarContentSection contentId={movie.id} type="Movie" />
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerId={movie.trailerId}
        title={movie.title}
      />
    </div>
  );
}
