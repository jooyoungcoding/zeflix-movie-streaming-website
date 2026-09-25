"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { CastMember } from "@/domain/movie/movie.types";

interface CastSectionProps {
  cast: CastMember[];
}

export default function CastSection({ cast }: CastSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [maxIndex, setMaxIndex] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  // Each item width + gap in px
  const itemWidth = 210; // approx width per cast item including gap
  const gap = 20;
  const itemStep = itemWidth + gap;

  useEffect(() => {
    const updateMaxIndex = () => {
      const desktop = window.innerWidth >= 640;
      setIsDesktop(desktop);
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const visibleCount = Math.floor(containerWidth / itemStep);
        const max = Math.max(0, cast.length - Math.max(1, visibleCount));
        setMaxIndex(max);
        setCurrentIndex((prev) => Math.min(prev, max));
      }
    };

    updateMaxIndex();
    window.addEventListener("resize", updateMaxIndex);
    return () => window.removeEventListener("resize", updateMaxIndex);
  }, [cast.length, itemStep]);

  if (!cast || cast.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 2));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 2));
  };

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  return (
    <div className="w-full space-y-4 my-6 sm:my-8">
      {/* Top Cast Title */}
      <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide font-custom2">
        Top Cast
      </h3>

      {/* Slider Viewport with Arrow Buttons & Edge Shadow Fades */}
      <div className="relative w-full flex items-center">
        {/* Left Dark Shadow Fade (Hidden on mobile) */}
        {canPrev && (
          <div className="hidden sm:block pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-black via-black/80 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Left Arrow Button (Hidden on mobile) */}
        {canPrev && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c202a]/95 hover:bg-black text-white items-center justify-center transition-all duration-200 border border-white/15 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Previous cast members"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Overflow Track Window: scroll-x on mobile, slider on desktop */}
        <div
          ref={containerRef}
          className="w-full overflow-x-auto sm:overflow-hidden scrollbar-hide py-1 touch-pan-x"
        >
          <div
            className="flex items-center sm:transition-transform sm:duration-500 sm:ease-out"
            style={{
              transform: isDesktop ? `translateX(-${currentIndex * itemStep}px)` : "none",
              gap: `${gap}px`,
            }}
          >
            {cast.map((member) => (
              <Link
                key={member.id}
                href={`/person/${member.id}`}
                className="shrink-0 flex items-center gap-3 select-none group/cast cursor-pointer hover:opacity-95 transition-opacity"
                style={{ width: `${itemWidth}px` }}
              >
                {/* Avatar Circle */}
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0 shadow-md group-hover/cast:ring-2 group-hover/cast:ring-emerald-500/50 transition-all duration-300">
                  {member.avatar ? (
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="object-cover group-hover/cast:scale-105 transition-transform duration-300"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Cast Member Names (no border, clean background) */}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white truncate block leading-tight group-hover/cast:text-emerald-400 transition-colors">
                    {member.name}
                  </span>
                  <span className="text-[11px] sm:text-xs text-zinc-400 truncate block leading-tight mt-0.5">
                    {member.character}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Dark Shadow Fade (Hidden on mobile) */}
        {canNext && (
          <div className="hidden sm:block pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-l from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Right Arrow Button (Hidden on mobile) */}
        {canNext && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c202a]/95 hover:bg-black text-white items-center justify-center transition-all duration-200 border border-white/15 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            aria-label="Next cast members"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
