"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, Film, AlertCircle, RotateCcw, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { BrowseItem } from "@/domain/movie/movie.types";

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query input (2s / 2000ms) before calling API & updating URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsDebouncing(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setActiveQuery(searchQuery);
      setPage(1);
      setIsDebouncing(false);

      // Update URL query param without full page reload
      const newUrl = searchQuery.trim()
        ? `/search?q=${encodeURIComponent(searchQuery.trim())}`
        : `/search`;
      router.replace(newUrl, { scroll: false });
    }, 2000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, router]);

  // Immediately submit search when pressing Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setIsDebouncing(false);
      setActiveQuery(searchQuery);
      setPage(1);

      const newUrl = searchQuery.trim()
        ? `/search?q=${encodeURIComponent(searchQuery.trim())}`
        : `/search`;
      router.replace(newUrl, { scroll: false });
    }
  };

  // Fetch initial results (page 1) whenever activeQuery changes
  useEffect(() => {
    let isMounted = true;

    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        setPage(1);

        const params = new URLSearchParams({
          q: activeQuery.trim(),
          page: "1",
          limit: "20",
        });

        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Search failed with status: ${res.status}`);
        }

        const data = await res.json();
        if (isMounted && data.items && Array.isArray(data.items)) {
          setItems(data.items);
          setHasMore(Boolean(data.hasMore));
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      isMounted = false;
    };
  }, [activeQuery]);

  // Handle "+ More" / "Show more" button (Fetch next 20 items)
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;

      const params = new URLSearchParams({
        q: activeQuery.trim(),
        page: String(nextPage),
        limit: "20",
      });

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load more: ${res.status}`);
      }

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        setItems((prev) => [...prev, ...data.items]);
        setPage(nextPage);
        setHasMore(Boolean(data.hasMore));
      }
    } catch (err) {
      console.error("Error loading more search items:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle "− Less" button (Shrink back to initial 20 items and scroll to top)
  const handleShowLess = () => {
    setItems((prev) => prev.slice(0, 20));
    setPage(1);
    setHasMore(true);

    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Bar: Left Search Result Heading & Right Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        {/* Left Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
          {activeQuery.trim() ? (
            <span>
              <span className="font-custom2">Result for </span>
              <span className="text-white">&quot;{activeQuery.trim()}&quot;</span>
            </span>
          ) : (
            <span className="font-custom2">Explore & Search</span>
          )}
        </h1>

        {/* Right Search Input */}
        <div className="relative w-full sm:w-80 md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search movies, series..."
            className="w-full bg-[#161922] hover:bg-[#1c202b] focus:bg-[#1c202b] border border-white/10 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner font-sans"
          />
          {isDebouncing ? (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-400 animate-spin pointer-events-none" />
          ) : (
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Main Grid: 5 columns x 4 rows (20 items initially) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 pt-6 animate-pulse">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-zinc-800/60 relative overflow-hidden"
            >
              <div className="absolute bottom-0 inset-x-0 p-3 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-700/80 rounded" />
                <div className="h-3 w-1/2 bg-zinc-700/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Search error occurred
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Please check your connection or try a different keyword.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setHasError(false);
              setPage(1);
            }}
            className="font-custom1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
            <Film className="w-7 h-7 opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              No results found for &ldquo;{activeQuery}&rdquo;
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm">
              Try checking for spelling errors or searching with more general keywords.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="font-custom1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm font-semibold text-black transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Search</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 pt-6">
            {items.map((item, index) => {
              const href =
                item.type === "TV Series"
                  ? `/tv/${item.id}`
                  : `/movies/${item.id}`;
              const primaryGenre =
                item.genres && item.genres.length > 0
                  ? item.genres[0]
                  : item.type === "TV Series"
                    ? "Drama"
                    : "Movie";

              return (
                <Link
                  key={`${item.type}-${item.id}-${index}`}
                  href={href}
                  className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151d] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/80 block select-none"
                >
                  {/* Poster Image */}
                  <Image
                    src={
                      item.poster ||
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80"
                    }
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* TV Season Badge (Top Left) */}
                  {item.type === "TV Series" && (
                    <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-zinc-300 shadow-md">
                      {item.season || "S1"}
                    </div>
                  )}

                  {/* Dark Gradient Overlay at Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Bottom Content Metadata */}
                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-10 space-y-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate drop-shadow">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 drop-shadow">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-semibold text-white">
                        {item.rating}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="truncate max-w-[80px]">
                        {primaryGenre}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="truncate">
                        {item.type === "TV Series"
                          ? item.season || "Series"
                          : "Movie"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination Controls: Show more / Less */}
          <div className="flex items-center justify-center gap-3 pt-10 pb-6">
            {/* Show Less Button (when more than 20 items loaded) */}
            {items.length > 20 && (
              <button
                type="button"
                onClick={handleShowLess}
                className="font-custom1 inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1c202b] hover:bg-[#282d3c] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                <ChevronUp className="w-4 h-4 text-zinc-400" />
                <span>Less</span>
              </button>
            )}

            {/* Show More Button (if more items available) */}
            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="font-custom1 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1c202b] hover:bg-[#282d3c] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Show more</span>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
