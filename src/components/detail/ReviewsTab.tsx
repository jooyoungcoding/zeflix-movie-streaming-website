"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Star, ChevronDown, User, MessageSquare, Plus } from "lucide-react";
import { ReviewItem } from "@/domain/movie/movie.types";

interface ReviewsTabProps {
  reviews: ReviewItem[];
  averageRating: string;
}

export default function ReviewsTab({
  reviews = [],
  averageRating,
}: ReviewsTabProps) {
  const [starFilter, setStarFilter] = useState<string>("all");
  const [sortFilter, setSortFilter] = useState<string>("newest");
  const [isStarOpen, setIsStarOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Filter & Sort purely based on real API data
  const filteredReviews = useMemo(() => {
    let list = Array.isArray(reviews) ? [...reviews] : [];
    if (starFilter !== "all") {
      const minScore = Number(starFilter);
      list = list.filter((r) => Math.round(r.rating * 2) >= minScore);
    }
    if (sortFilter === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortFilter === "lowest") {
      list.sort((a, b) => a.rating - b.rating);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [reviews, starFilter, sortFilter]);

  const parsed = Number(averageRating);
  const numRating = !isNaN(parsed) ? parsed : 0;

  // Compute dynamic distribution chart based strictly on real reviews
  const distribution = useMemo(() => {
    // 10 score buckets on scale 1 to 10
    const buckets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const counts = buckets.map((score) => {
      return reviews.filter((r) => {
        // Convert to scale 1-10 (ReviewItem rating is 0-5)
        const score10 = Math.min(10, Math.max(1, Math.round(r.rating * 2)));
        return score10 === score;
      }).length;
    });

    const maxCount = Math.max(...counts, 1);

    return buckets.map((score, idx) => {
      const count = counts[idx];
      const height = count > 0 ? `${Math.max(18, Math.round((count / maxCount) * 100))}%` : "6%";
      return {
        label: String(score),
        count,
        height,
        hasCount: count > 0,
      };
    });
  }, [reviews]);

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = filteredReviews.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Grid: On mobile chart is on top (order-1) and reviews below (order-2); on desktop reviews left (order-1 lg:col-span-8) and chart right (order-2 lg:col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rating Summary Box (Chart): Top on Mobile (order-1), Right Column on Desktop (order-2) */}
        <div className="order-1 lg:order-2 lg:col-span-4 xl:col-span-3 p-5 rounded-2xl bg-[#181a20] shadow-2xl space-y-3.5 border border-white/5 lg:sticky lg:top-24">
          {/* Header with Star Score and Total Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-xl sm:text-2xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{numRating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] sm:text-xs text-zinc-400 font-normal">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Count Numbers Above Bars */}
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium px-0.5">
            {distribution.map((d) => (
              <span
                key={d.label}
                className={`w-4 text-center ${d.hasCount ? "text-zinc-300 font-semibold" : "text-zinc-600"}`}
              >
                {d.count}
              </span>
            ))}
          </div>

          {/* Histogram Bars Container */}
          <div className="h-20 flex items-end justify-between gap-1 py-1">
            {distribution.map((d) => (
              <div
                key={d.label}
                className="flex-1 h-full bg-[#0d0f14] rounded-sm flex items-end overflow-hidden"
              >
                <div
                  className={`w-full transition-all duration-500 rounded-t-xs ${
                    d.hasCount ? "bg-zinc-400" : "bg-zinc-800/40"
                  }`}
                  style={{ height: d.height }}
                />
              </div>
            ))}
          </div>

          {/* Scale Numbers (1 - 10) Below Bars */}
          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-medium px-0.5">
            {distribution.map((d) => (
              <span
                key={d.label}
                className={`w-4 text-center ${d.hasCount ? "text-zinc-300 font-medium" : "text-zinc-600"}`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews Area (Filters + 3-Column Reviews Grid): Bottom on Mobile (order-2), Left Column on Desktop (order-1) */}
        <div className="order-2 lg:order-1 lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Top Filter Dropdown Controls */}
          <div className="flex items-center gap-3">
            {/* Stars Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsStarOpen((prev) => !prev);
                  setIsSortOpen(false);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181a20] hover:bg-[#22252e] text-xs sm:text-sm font-medium text-zinc-300 border border-white/10 transition-colors cursor-pointer"
              >
                <span>
                  {starFilter === "all"
                    ? "All ratings"
                    : starFilter === "10"
                      ? "10 rating"
                      : `${starFilter}+ rating`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {isStarOpen && (
                <div className="absolute left-0 mt-1.5 w-32 max-h-56 overflow-y-auto bg-[#181a20] rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 border border-white/10 custom-scrollbar">
                  {[
                    { label: "All ratings", val: "all" },
                    { label: "10 rating", val: "10" },
                    { label: "9+ rating", val: "9" },
                    { label: "8+ rating", val: "8" },
                    { label: "7+ rating", val: "7" },
                    { label: "6+ rating", val: "6" },
                    { label: "5+ rating", val: "5" },
                    { label: "4+ rating", val: "4" },
                    { label: "3+ rating", val: "3" },
                    { label: "2+ rating", val: "2" },
                    { label: "1+ rating", val: "1" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setStarFilter(opt.val);
                        setIsStarOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen((prev) => !prev);
                  setIsStarOpen(false);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181a20] hover:bg-[#22252e] text-xs sm:text-sm font-medium text-zinc-300 border border-white/10 transition-colors cursor-pointer"
              >
                <span>
                  {sortFilter === "newest"
                    ? "Newest"
                    : sortFilter === "highest"
                      ? "Highest rated"
                      : "Lowest rated"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {isSortOpen && (
                <div className="absolute left-0 mt-1.5 w-36 bg-[#181a20] rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 border border-white/10">
                  {[
                    { label: "Newest", val: "newest" },
                    { label: "Highest rated", val: "highest" },
                    { label: "Lowest rated", val: "lowest" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSortFilter(opt.val);
                        setIsSortOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3-Column Reviews Grid (Màu nền trùng với background, no border) */}
          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm bg-transparent flex flex-col items-center justify-center gap-2.5">
              <MessageSquare className="w-8 h-8 text-zinc-600" />
              <span className="text-zinc-400 font-medium">No community reviews available for this title yet.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
              {visibleReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="flex flex-col justify-between bg-transparent space-y-3 select-none"
                >
                  {/* Title & Review Content */}
                  <div className="space-y-1.5">
                    <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-1">
                      {rev.content.slice(0, 36).split("\n")[0]}
                    </h4>
                    <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed line-clamp-4">
                      {rev.content}
                    </p>
                  </div>

                  {/* Author & Rating Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                        {rev.avatar ? (
                          <Image
                            src={rev.avatar}
                            alt={rev.author}
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <User className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 truncate max-w-[110px]">
                        {rev.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{(rev.rating * 2).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* More / Less Toggle Button */}
          {filteredReviews.length > 6 && (
            <div className="flex justify-center pt-6">
              {hasMore ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#181a20] hover:bg-[#22252e] text-xs sm:text-sm font-semibold text-white border border-white/10 transition-all active:scale-95 cursor-pointer shadow-lg hover:text-emerald-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>More</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setVisibleCount(6)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#181a20] hover:bg-[#22252e] text-xs sm:text-sm font-semibold text-white border border-white/10 transition-all active:scale-95 cursor-pointer shadow-lg hover:text-emerald-400"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                  <span>Less</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
