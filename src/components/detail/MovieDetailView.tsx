"use client";

import React, { useState } from "react";
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
import { MovieDetail } from "@/domain/movie/movie.types";
import BackButton from "@/components/BackButton";
import CastSection from "./CastSection";
import ReviewsTab from "./ReviewsTab";
import SimilarContentSection from "./SimilarContentSection";
import TrailerModal from "./TrailerModal";

interface MovieDetailViewProps {
  movie: MovieDetail;
}

export default function MovieDetailView({ movie }: MovieDetailViewProps) {
  const router = useRouter();
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
  const [isWatchlist, setIsWatchlist] = useState<boolean>(false);

  const handleWatchNow = () => {
    router.push(`/watch/movie/${movie.id}`);
  };

  const toggleWatchlist = () => {
    const nextState = !isWatchlist;
    setIsWatchlist(nextState);
    if (nextState) {
      toast.success(`Added "${movie.title}" to Watchlist!`, {
        id: `fav-${movie.id}`,
        icon: "🔖",
        duration: 2500,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    } else {
      toast(`Removed "${movie.title}" from Watchlist`, {
        id: `fav-${movie.id}`,
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
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-white pb-24">
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
              className="object-cover object-center brightness-[0.38]"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-[#0d1017]" />
          )}

          {/* Gradients */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent lg:w-3/4" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black via-black/90 to-transparent" />
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
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs sm:text-[13px] font-custom2 tracking-wide">
                  <span>{movie.tagline}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight">
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
              {/* Left Action Buttons (Row 1 on mobile) */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                {/* Watch Now Button */}
                <button
                  type="button"
                  onClick={handleWatchNow}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-3 rounded-xl bg-[#2ca566] hover:bg-emerald-500 active:scale-95 text-white font-custom1 text-sm sm:text-base font-bold tracking-wide transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Now</span>
                </button>

                {/* Watchlist Bookmark Button */}
                <button
                  type="button"
                  onClick={toggleWatchlist}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-white font-custom1 text-sm sm:text-base font-semibold border border-white/10 transition-all cursor-pointer group/fav"
                >
                  {isWatchlist ? (
                    <>
                      <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400 stroke-yellow-400 scale-110 shrink-0 transition-transform" />
                      <span className="truncate">Added</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2] text-white group-hover/fav:text-yellow-400 group-hover/fav:scale-110 shrink-0 transition-all" />
                      <span className="truncate">Add Watchlist</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Action Buttons (Row 2 on mobile: Trailer, Download, Copy Link nằm ngang bên dưới) */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-start md:justify-end md:ml-auto">
                {/* Watch Trailer Button */}
                {movie.trailerId && (
                  <button
                    type="button"
                    onClick={() => setIsTrailerOpen(true)}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-custom1 text-sm sm:text-base font-semibold backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-md"
                  >
                    <Tv className="w-4 h-4 text-emerald-400" />
                    <span>Trailer</span>
                  </button>
                )}

                {/* Download Quick Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center p-3 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-md shrink-0"
                  title="Download"
                  aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Share / Copy Link Quick Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center p-3 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-md shrink-0"
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
          <div className="flex items-center gap-8">
            <button
              type="button"
              className="relative pb-3 text-sm sm:text-base font-bold text-white tracking-wide transition-colors cursor-pointer"
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
