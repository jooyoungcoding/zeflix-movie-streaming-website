"use client";

import React from "react";
import MoviesOnAwards from "@/components/MoviesOnAwards";
import TVSeriesOnAwards from "@/components/TVSeriesOnAwards";

export default function AwardsSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        {/* Left Column: Movies on Awards */}
        <div className="w-full">
          <MoviesOnAwards />
        </div>

        {/* Right Column: TV Series on Awards */}
        <div className="w-full">
          <TVSeriesOnAwards />
        </div>
      </div>
    </section>
  );
}
