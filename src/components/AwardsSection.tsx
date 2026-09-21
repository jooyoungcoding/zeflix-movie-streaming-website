"use client";

import React, { useState } from "react";
import MoviesOnAwards from "@/components/MoviesOnAwards";
import TVSeriesOnAwards from "@/components/TVSeriesOnAwards";

export default function AwardsSection() {
  const [hasMovies, setHasMovies] = useState<boolean | null>(null);
  const [hasSeries, setHasSeries] = useState<boolean | null>(null);

  // If both finished loading and neither has award-winning content, hide the entire section
  if (hasMovies === false && hasSeries === false) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
      <div
        className={`grid gap-8 lg:gap-10 items-stretch ${
          hasMovies !== false && hasSeries !== false
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1 max-w-3xl mx-auto"
        }`}
      >
        {/* Left Column: Movies on Awards */}
        {hasMovies !== false && (
          <div className="w-full">
            <MoviesOnAwards onDataStatus={(hasData) => setHasMovies(hasData)} />
          </div>
        )}

        {/* Right Column: TV Series on Awards */}
        {hasSeries !== false && (
          <div className="w-full">
            <TVSeriesOnAwards onDataStatus={(hasData) => setHasSeries(hasData)} />
          </div>
        )}
      </div>
    </section>
  );
}
