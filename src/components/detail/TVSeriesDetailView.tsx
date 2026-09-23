"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Play,
  Bookmark,
  Star,
  Download,
  Share2,
  Tv,
} from "lucide-react";
import toast from "react-hot-toast";
import { TVSeriesDetail } from "@/domain/movie/movie.types";
import BackButton from "@/components/BackButton";
import CastSection from "./CastSection";
import EpisodesTab from "./EpisodesTab";
import ReviewsTab from "./ReviewsTab";
import SimilarContentSection from "./SimilarContentSection";
import TrailerModal from "./TrailerModal";
import {
  requestCheckWatchlistStatus,
  requestToggleWatchlist,
} from "@/features/watchlist/api/watchlist.api";
import { useAuthStore } from "@/store/auth.store";
import { useAuthModalStore } from "@/store/auth-modal.store";

interface TVSeriesDetailViewProps {
  tv: TVSeriesDetail;
}

export default function TVSeriesDetailView({ tv }: TVSeriesDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"episodes" | "reviews">("episodes");
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
  const [isWatchlist, setIsWatchlist] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [tv.id]);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      const userId = useAuthStore.getState().user_id;
      if (!userId) {
        setIsWatchlist(false);
        return;
      }

      try {
        const tmdbId = parseInt(tv.id, 10);
        if (!isNaN(tmdbId)) {
          const res = await requestCheckWatchlistStatus(tmdbId, "tv");
          if (isMounted && res.success) {
            setIsWatchlist(res.isAdded);
          }
        }
      } catch {
        // Not logged in or error
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [tv.id]);

  const handleWatchNow = () => {
    // Navigate to first episode of active season or season 1 episode 1
    const firstEp = tv.episodes[0];
    const sNum = firstEp?.seasonNumber || tv.currentSeasonNumber || 1;
    const epNum = firstEp?.episodeNumber || 1;
    router.push(`/watch/tv/${tv.id}/${sNum}/${epNum}`);
  };

  const toggleWatchlist = async () => {
    if (isToggling) return;
    const userId = useAuthStore.getState().user_id;
    if (!userId) {
      useAuthModalStore.getState().openModal({
        title: "Sign in to use Watchlist",
        description: `Please sign in or register an account to add "${tv.title}" to your watchlist.`,
      });
      return;
    }

    const tmdbId = parseInt(tv.id, 10);
    if (isNaN(tmdbId)) return;

    const nextState = !isWatchlist;
    setIsWatchlist(nextState);
    setIsToggling(true);

    try {
      const res = await requestToggleWatchlist({
        tmdb_id: tmdbId,
        type: "tv",
        title: tv.title,
        poster_path: tv.poster,
        backdrop_path: tv.backdrop,
        vote_average: parseFloat(tv.rating) || 0,
        release_date: tv.year,
        overview: tv.description,
        action: nextState ? "add" : "remove",
      });

      if (res.success) {
        setIsWatchlist(res.data.isAdded);
      }
    } catch (err: unknown) {
      setIsWatchlist(!nextState);
      const msg = err instanceof Error ? err.message : "Failed to update watchlist";
      toast.error(msg, {
        id: `fav-err-${tv.id}`,
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

  const handleDownload = () => {
    toast("Download feature will be available soon!", {
      id: "download-info",
      icon: "📥",
      duration: 2000,
      style: {
        background: "#12151c",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
      },
    });
  };

  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-white pb-24 preserve-dark"
      data-preserve-dark="true"
    >
      {/* Hero Backdrop Section */}
      <div className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col">
        {/* Full-width Background Image */}
        <div className="absolute inset-0 z-0">
          {tv.backdrop ? (
            <Image
              src={tv.backdrop}
              alt={tv.title}
              fill
              priority
              className="object-cover object-center brightness-[0.55] sm:brightness-[0.38] transition-all duration-300"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-[#0d1017]" />
          )}

          {/* Gradients: Lighter on mobile so backdrop shines through, deeper on desktop for readability */}
          <div className="absolute top-0 inset-x-0 h-20 sm:h-32 bg-gradient-to-b from-black/70 via-black/20 to-transparent sm:from-black sm:via-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/80 sm:to-transparent lg:w-3/4" />
          <div className="absolute bottom-0 inset-x-0 h-24 sm:h-44 bg-gradient-to-t from-black via-black/60 sm:via-black/90 to-transparent" />
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
              {tv.tagline ? (
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs sm:text-[13px] font-custom2 tracking-wide shadow-sm">
                  <span>{tv.tagline}</span>
                </div>
              ) : tv.seasons.length > 0 ? (
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs sm:text-[13px] font-custom2 tracking-wide shadow-sm">
                  <span>
                    {tv.seasons.length > 1
                      ? `${tv.seasons.length} Seasons Available`
                      : "Season 1 is out!"}
                  </span>
                </div>
              ) : null}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {tv.title}
              </h1>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium text-zinc-300">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{tv.rating}</span>
                </div>

                {tv.year && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>{tv.year}</span>
                  </>
                )}

                {tv.duration && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>{tv.duration}</span>
                  </>
                )}

                {tv.genres && tv.genres.length > 0 && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      {tv.genres.map((genre, idx) => (
                        <React.Fragment key={genre}>
                          {idx > 0 && <span className="text-zinc-600">,</span>}
                          <span>{genre}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}

                {tv.certificate && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[11px] font-semibold">
                      {tv.certificate}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons Row (Spans Full Width: Left buttons on left, 3 buttons on the far right on desktop; on mobile: Trailer, Download, Copy Link row sits horizontally below Watch Now & Watchlist) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pt-1 w-full">
              {/* Left Action Buttons (Row 1 on mobile: Watch Now & Add Watchlist) */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                {/* Watch Now Button (Hidden for upcoming / unreleased TV series) */}
                {!(
                  tv.isUpcoming ??
                  (Boolean(tv.releaseDate && tv.releaseDate > new Date().toISOString().split("T")[0]) ||
                    Boolean(
                      tv.status &&
                      !["returning series", "ended", "canceled", "released"].includes(
                        tv.status.toLowerCase()
                      )
                    ))
                ) && (
                    <button
                      type="button"
                      onClick={handleWatchNow}
                      className="flex-1 sm:flex-initial h-11 sm:h-12 min-w-[140px] sm:min-w-[160px] inline-flex items-center justify-center gap-2 px-6 sm:px-8 rounded-xl bg-[#2ca566] hover:bg-emerald-500 active:scale-95 text-white font-custom1 text-sm sm:text-base font-bold tracking-wide transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white shrink-0" />
                      <span>Watch Now</span>
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

              {/* Right Action Buttons (Row 2 on mobile: Trailer, Download, Copy Link horizontally balanced) */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-start md:justify-end md:ml-auto">
                {tv.trailerId && (
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="flex-1 md:flex-initial h-11 sm:h-12 inline-flex items-center justify-center gap-2 px-4 sm:px-5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-custom1 text-sm sm:text-base font-semibold backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-md"
                  >
                    <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Trailer</span>
                  </button>
                )}

                {/* Download Quick Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-11 sm:w-12 h-11 sm:h-12 inline-flex items-center justify-center rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-md shrink-0"
                  title="Download"
                  aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

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
            {tv.description || "No overview available for this series."}
          </p>
        </div>

        {/* Top Cast Section */}
        <CastSection cast={tv.cast} />

        {/* Navigation Tabs: Episodes & Reviews */}
        <div className="w-full border-b border-white/10 pb-1">
          <div className="flex items-center gap-8 font-custom2">
            <button
              type="button"
              onClick={() => setActiveTab("episodes")}
              className={`relative pb-3 text-sm sm:text-base font-bold font-custom2 tracking-wide transition-colors cursor-pointer ${activeTab === "episodes" ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
            >
              <span>Episodes</span>
              {activeTab === "episodes" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`relative pb-3 text-sm sm:text-base font-bold font-custom2 tracking-wide transition-colors cursor-pointer ${activeTab === "reviews" ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
            >
              <span>Reviews</span>
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "episodes" ? (
          <EpisodesTab
            tvId={tv.id}
            seasons={tv.seasons}
            initialEpisodes={tv.episodes}
            currentSeasonNumber={tv.currentSeasonNumber}
          />
        ) : (
          <ReviewsTab reviews={tv.reviews} averageRating={tv.rating} />
        )}

        {/* Similar TV Series For You */}
        <SimilarContentSection contentId={tv.id} type="TV Series" />
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerId={tv.trailerId}
        title={tv.title}
      />
    </div>
  );
}
