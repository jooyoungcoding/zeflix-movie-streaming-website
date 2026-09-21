"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { MediaType, MediaItem } from "@/domain/movie/movie.types";

export type { MediaType, MediaItem };

export interface CountryItem {
  id: string;
  label: string;
  adjective: string;
}

export const COUNTRIES: CountryItem[] = [
  { id: "all", label: "All", adjective: "All" },
  { id: "us", label: "US", adjective: "US" },
  { id: "uk", label: "UK", adjective: "UK" },
  { id: "korea", label: "Korea", adjective: "Korean" },
  { id: "japan", label: "Japan", adjective: "Japanese" },
  { id: "china", label: "China", adjective: "Chinese" },
];

export default function BrowseByCountry() {
  const [selectedType, setSelectedType] = useState<MediaType>("Movies");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchBrowseContent() {
      try {
        setIsLoading(true);
        setHasError(false);
        const params = new URLSearchParams({
          type: selectedType,
          country: selectedCountry,
        });

        const res = await fetch(`/api/browse?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch browse content: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch (err) {
        console.error("Error fetching browse content:", err);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBrowseContent();

    return () => {
      isMounted = false;
    };
  }, [selectedType, selectedCountry]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [items]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollPosition, 350);
    }
  };

  const currentCountryObj = COUNTRIES.find((c) => c.id === selectedCountry);
  const countryTitle = currentCountryObj ? currentCountryObj.label : "All";
  const sectionTitle = `${countryTitle} ${selectedType}`;

  const getDiscoverHref = () => {
    const tab = selectedType === "Movies" ? "movies" : "tv";
    let countryCode = "all";
    switch (selectedCountry.toLowerCase()) {
      case "us":
        countryCode = "US";
        break;
      case "uk":
        countryCode = "GB";
        break;
      case "korea":
        countryCode = "KR";
        break;
      case "japan":
        countryCode = "JP";
        break;
      case "china":
        countryCode = "CN";
        break;
      case "all":
      default:
        countryCode = selectedCountry.length === 2 ? selectedCountry.toUpperCase() : selectedCountry;
        break;
    }
    return `/discover?tab=${tab}&country=${countryCode}&genre=all&sort=all#browse-section`;
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative overflow-hidden">
      {/* Top Header & Type Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
            {sectionTitle}
          </h2>
        </div>

        {/* Type Toggle Buttons (Movies | TV Series) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[#12151c] border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedType("Movies")}
              className={`font-custom1 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 ${selectedType === "Movies"
                  ? "bg-[#2ca566] text-white shadow-lg shadow-emerald-950/40"
                  : "text-zinc-400 hover:text-white"
                }`}
            >
              Movies
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("TV Series")}
              className={`font-custom1 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 ${selectedType === "TV Series"
                  ? "bg-[#2ca566] text-white shadow-lg shadow-emerald-950/40"
                  : "text-zinc-400 hover:text-white"
                }`}
            >
              TV Series
            </button>
          </div>

          <Link
            href={getDiscoverHref()}
            className="font-custom1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 bg-[#1c202a] hover:bg-[#282e3c] hover:text-white border border-white/10 shadow-sm transition-all duration-200 active:scale-95"
          >
            See all
          </Link>
        </div>
      </div>

      {/* Country Filter Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-5">
        {COUNTRIES.map((country) => {
          const isActive = selectedCountry === country.id;
          return (
            <button
              key={country.id}
              type="button"
              onClick={() => setSelectedCountry(country.id)}
              className={`font-custom1 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer select-none active:scale-95 ${isActive
                  ? "bg-white text-black font-bold shadow-lg"
                  : "bg-[#161922] text-zinc-400 hover:text-white hover:bg-[#222834] border border-white/10"
                }`}
            >
              {country.label}
            </button>
          );
        })}
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Dark Shadow Fade */}
        {canScrollLeft && (
          <div className="hidden md:block pointer-events-none absolute left-0 top-0 bottom-0 w-24 lg:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute left-1.5 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Right Dark Shadow Fade */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 lg:w-48 bg-gradient-to-l from-black via-black/85 to-transparent z-20 transition-opacity duration-300" />
        )}

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute right-1.5 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}

        {/* Content Loading State */}
        {isLoading ? (
          <div className="flex items-start gap-4 sm:gap-5 overflow-hidden animate-pulse min-h-[220px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[230px] sm:w-[260px] md:w-[280px]"
              >
                <div className="w-full aspect-[16/10] rounded-2xl bg-zinc-800/80 mb-3" />
                <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#12151c] border border-white/10 text-center min-h-[200px]">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-sm text-zinc-400">Unable to load content right now.</p>
          </div>
        ) : items.length > 0 ? (
          /* Cards Horizontal Scroll List */
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 scroll-smooth snap-x px-1 min-h-[220px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item) => {
              const href =
                item.type === "Movies" ? `/movies/${item.id}` : `/tv/${item.id}`;
              const firstGenre =
                item.genres && item.genres.length > 0 ? item.genres[0] : null;
              const remainingGenres = Math.max((item.genres?.length || 0) - 1, 0);

              return (
                <Link
                  key={item.id}
                  href={href}
                  className="group shrink-0 w-[230px] sm:w-[260px] md:w-[280px] select-none cursor-pointer snap-start"
                >
                  {/* Landscape Thumbnail Box */}
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#12151c] shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                    {item.backdrop ? (
                      <Image
                        src={item.backdrop}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 230px, (max-width: 768px) 260px, 280px"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#151922] flex items-center justify-center text-xs text-zinc-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata Below Thumbnail */}
                  <div className="mt-3 flex flex-col space-y-1">
                    <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-wide truncate group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>

                      {firstGenre && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="truncate">
                            {firstGenre}
                            {remainingGenres > 0 && ` +${remainingGenres}`}
                          </span>
                        </>
                      )}

                      <span className="text-zinc-600">•</span>
                      <span>{item.type}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="w-full py-12 flex items-center justify-center text-zinc-500 text-sm font-medium">
            No titles available for this filter
          </div>
        )}
      </div>
    </section>
  );
}
