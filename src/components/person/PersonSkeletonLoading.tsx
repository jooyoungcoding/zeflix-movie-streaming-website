"use client";

import React, { useEffect } from "react";

export default function PersonSkeletonLoading() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-white pb-24 animate-pulse">
      {/* 1. HERO SKELETON */}
      <section className="relative pt-24 sm:pt-32 pb-12 overflow-hidden bg-gradient-to-b from-[#10141f]/70 via-[#07090e]/80 to-[#07090e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Back button placeholder */}
          <div className="w-24 h-9 rounded-xl bg-white/10" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 pt-2">
            {/* Avatar skeleton */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl bg-white/10 shrink-0 shadow-2xl" />

            {/* Header info skeleton */}
            <div className="flex-1 space-y-4 text-center md:text-left w-full">
              <div className="h-9 sm:h-12 w-64 md:w-96 bg-white/15 rounded-xl mx-auto md:mx-0" />
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                <div className="h-6 w-24 bg-white/10 rounded-lg" />
                <div className="h-6 w-36 bg-white/10 rounded-lg" />
                <div className="h-6 w-40 bg-white/10 rounded-lg" />
              </div>

              {/* Biography lines */}
              <div className="space-y-2 pt-3 max-w-3xl">
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-5/6 bg-white/10 rounded" />
                <div className="h-4 w-4/6 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KNOWN FOR SKELETON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="h-8 w-40 bg-white/10 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-white/10 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 p-3 space-y-2">
                <div className="h-4 w-3/4 bg-white/15 rounded" />
                <div className="h-3 w-1/2 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FILMOGRAPHY SKELETON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filter Controls Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Media type pills skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-16 bg-white/10 rounded-xl" />
            <div className="h-9 w-24 bg-white/10 rounded-xl" />
            <div className="h-9 w-24 bg-white/10 rounded-xl" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-48 sm:w-64 bg-white/10 rounded-xl" />
            <div className="h-10 w-28 bg-white/10 rounded-xl" />
          </div>
        </div>

        {/* Cards skeleton matching Release page */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-14 bg-white/10 rounded" />
            <span className="text-zinc-600 font-bold">•</span>
            <div className="h-6 w-24 bg-white/10 rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 sm:gap-4 p-3.5 rounded-2xl bg-[#0d1017]"
              >
                <div className="w-12 h-12 rounded-full bg-white/15 shrink-0" />
                <div className="w-16 h-24 rounded-xl bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="w-3/4 h-5 bg-white/15 rounded-md" />
                  <div className="w-1/2 h-3.5 bg-white/10 rounded-md" />
                  <div className="w-20 h-5 bg-white/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
