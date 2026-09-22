"use client";

import React, { useEffect } from "react";

export default function DetailSkeletonLoading() {
  // Ensure page always scrolls to top immediately when loading begins
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-24 animate-pulse">
      {/* Hero Backdrop Skeleton */}
      <div className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] bg-[#0c0e14] border-b border-zinc-800/40 flex flex-col justify-between">
        {/* Shimmer Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-[#12151c]/80 to-black/40" />

        {/* Top Navbar Spacing & Back Button Skeleton */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex items-center justify-between">
          <div className="w-28 sm:w-32 h-10 rounded-full bg-zinc-800/70 border border-white/5" />
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800/60" />
            <div className="w-10 h-10 rounded-full bg-zinc-800/60" />
          </div>
        </div>

        {/* Main Hero Content Skeleton */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 flex flex-col space-y-4 sm:space-y-6">
          {/* Metadata Badges (Rating, Year, Duration, Certification) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="w-16 h-6 rounded-md bg-amber-500/20 border border-amber-500/30" />
            <div className="w-12 h-6 rounded-md bg-zinc-800/80" />
            <div className="w-16 h-6 rounded-md bg-zinc-800/80" />
            <div className="w-14 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30" />
          </div>

          {/* Big Title Skeleton */}
          <div className="space-y-2 max-w-2xl">
            <div className="w-3/4 sm:w-2/3 h-10 sm:h-12 lg:h-14 rounded-xl bg-zinc-800/90" />
            <div className="w-1/2 h-6 sm:h-8 rounded-lg bg-zinc-800/60" />
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="w-20 h-7 rounded-full bg-zinc-800/80" />
            <div className="w-24 h-7 rounded-full bg-zinc-800/80" />
            <div className="w-16 h-7 rounded-full bg-zinc-800/80" />
          </div>

          {/* Action Buttons (Watch Now, Trailer, Watchlist, Share) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
            <div className="w-36 sm:w-44 h-12 rounded-xl bg-emerald-500/40" />
            <div className="w-32 sm:w-36 h-12 rounded-xl bg-zinc-800/80 border border-white/10" />
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10" />
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10" />
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-12 sm:space-y-16">
        {/* Storyline / Overview Skeleton */}
        <div className="max-w-4xl space-y-3">
          <div className="w-36 h-7 rounded-md bg-zinc-800/80" />
          <div className="space-y-2 pt-2">
            <div className="w-full h-4 rounded bg-zinc-800/60" />
            <div className="w-11/12 h-4 rounded bg-zinc-800/60" />
            <div className="w-4/5 h-4 rounded bg-zinc-800/50" />
          </div>
        </div>

        {/* Cast Section Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-32 h-7 rounded-md bg-zinc-800/80" />
            <div className="w-16 h-5 rounded bg-zinc-800/40" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-[#12151c]/60 border border-white/5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800/80" />
                <div className="w-16 h-3 rounded bg-zinc-800/70" />
                <div className="w-12 h-2.5 rounded bg-zinc-800/40" />
              </div>
            ))}
          </div>
        </div>

        {/* Tabs / Similar Content Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-zinc-800/60 pb-3">
            <div className="w-28 h-8 rounded-lg bg-zinc-800/80" />
            <div className="w-24 h-8 rounded-lg bg-zinc-800/40" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="w-full aspect-[2/3] rounded-xl bg-zinc-800/70 border border-white/5" />
                <div className="w-3/4 h-4 rounded bg-zinc-800/70" />
                <div className="w-1/2 h-3 rounded bg-zinc-800/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
