"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
  Tv,
  Star,
  ChevronDown,
  Check,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { BrowseItem, GenreOption, CountryOption } from "@/domain/movie/movie.types";

export const SORT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "popular", label: "Popular" },
  { value: "new-releases", label: "New Released" },
  { value: "most-rated", label: "Most Rated" },
  { value: "worst-rated", label: "Worst Rated" },
  { value: "title-asc", label: "A-Z" },
  { value: "title-desc", label: "Z-A" },
];

type MediaTypeTab = "all" | "movies" | "tv";

export default function BrowseSection() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<MediaTypeTab>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("all");

  // Sync state from URL query parameters if present
  useEffect(() => {
    if (!searchParams) return;

    const tabParam = searchParams.get("tab") || searchParams.get("type");
    if (tabParam === "all" || tabParam === "movies" || tabParam === "tv") {
      setActiveTab(tabParam as MediaTypeTab);
    }

    const countryParam = searchParams.get("country");
    if (countryParam) {
      setSelectedCountry(
        countryParam.toLowerCase() === "all" ? "all" : countryParam.toUpperCase()
      );
    }

    const genreParam = searchParams.get("genre");
    if (genreParam) {
      setSelectedGenre(genreParam);
    }

    const sortParam = searchParams.get("sort");
    if (sortParam) {
      if (
        sortParam === "new-releases" ||
        sortParam === "new-released" ||
        sortParam === "new_releases" ||
        sortParam === "new_released"
      ) {
        setSelectedSort("new-releases");
      } else {
        setSelectedSort(sortParam);
      }
    }
  }, [searchParams]);

  // Auto-scroll into view when navigation contains filter query parameters or #browse-section hash
  useEffect(() => {
    if (!searchParams) return;

    const hasSpecificFilter =
      searchParams.has("sort") ||
      searchParams.has("tab") ||
      searchParams.has("type") ||
      searchParams.has("genre") ||
      searchParams.has("country");

    if (
      hasSpecificFilter ||
      (typeof window !== "undefined" && window.location.hash === "#browse-section")
    ) {
      const timer = setTimeout(() => {
        const el = document.getElementById("browse-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Dropdown open states
  const [isCountryOpen, setIsCountryOpen] = useState<boolean>(false);
  const [isGenreOpen, setIsGenreOpen] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryOpen(false);
      }
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenreOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch countries dynamically from TMDB API
  useEffect(() => {
    let isMounted = true;
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/countries");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.countries && Array.isArray(data.countries)) {
            setCountries(data.countries);
          }
        }
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };

    fetchCountries();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch genres whenever activeTab changes
  useEffect(() => {
    let isMounted = true;
    const fetchGenres = async () => {
      try {
        const genreType =
          activeTab === "movies"
            ? "movie"
            : activeTab === "tv"
              ? "tv"
              : "all";
        const res = await fetch(`/api/genres?type=${genreType}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.genres && Array.isArray(data.genres)) {
            setGenres(data.genres);
          }
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };

    fetchGenres();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Fetch initial data (Page 1) when filters or tabs change
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        setPage(1);

        const params = new URLSearchParams({
          type: activeTab,
          country: selectedCountry,
          sort: selectedSort,
          page: "1",
          limit: "20",
        });
        if (selectedGenre !== "all") {
          params.append("genre", selectedGenre);
        }

        const res = await fetch(`/api/browse?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && data.items && Array.isArray(data.items)) {
          setItems(data.items);
          setHasMore(Boolean(data.hasMore));
        }
      } catch (err) {
        console.error("Error fetching browse grid items:", err);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedCountry, selectedGenre, selectedSort]);

  // Handle "+ More"
  const handleMore = async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;

      const params = new URLSearchParams({
        type: activeTab,
        country: selectedCountry,
        sort: selectedSort,
        page: String(nextPage),
        limit: "20",
      });
      if (selectedGenre !== "all") {
        params.append("genre", selectedGenre);
      }

      const res = await fetch(`/api/browse?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load more: ${res.status}`);
      }
      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        setItems((prev) => [...prev, ...data.items]);
        setPage(nextPage);
        setHasMore(Boolean(data.hasMore));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching more items:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle "− Less"
  const handleLess = () => {
    if (items.length <= 20) return;
    setItems((prev) => prev.slice(0, prev.length - 20));
    setPage((prev) => Math.max(1, prev - 1));
    setHasMore(true);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCountry("all");
    setSelectedGenre("all");
    setSelectedSort("all");
  };

  // Format genre presentation
  const formatGenreDisplay = (genresList: string[]) => {
    if (!genresList || genresList.length === 0) return "General";
    if (genresList.length === 1) return genresList[0];
    return `${genresList[0]} +${genresList.length - 1}`;
  };

  const selectedCountryLabel =
    selectedCountry === "all"
      ? "All Countries"
      : countries.find(
          (c) => c.code.toLowerCase() === selectedCountry.toLowerCase()
        )?.name || selectedCountry;
  const selectedGenreLabel =
    genres.find((g) => String(g.id) === selectedGenre)?.name ||
    (selectedGenre === "all" ? "All Genres" : "Genre");
  const selectedSortLabel =
    SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || "All";

  return (
    <section
      id="browse-section"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-16 sm:scroll-mt-20"
    >
      {/* Top Bar: Left Media Tabs & Right Dropdown Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        {/* Left Media Tabs (ALL | Movie | Series) */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setSelectedGenre("all");
            }}
            className={`font-custom1 pb-2 text-sm sm:text-base font-semibold transition-all relative cursor-pointer select-none ${activeTab === "all"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-500 after:rounded-full"
                : "text-zinc-400 hover:text-white"
              }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("movies");
              setSelectedGenre("all");
            }}
            className={`font-custom1 flex items-center gap-2 pb-2 text-sm sm:text-base font-semibold transition-all relative cursor-pointer select-none ${activeTab === "movies"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-500 after:rounded-full"
                : "text-zinc-400 hover:text-white"
              }`}
          >
            <Film className="w-4 h-4" />
            <span>Movie</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("tv");
              setSelectedGenre("all");
            }}
            className={`font-custom1 flex items-center gap-2 pb-2 text-sm sm:text-base font-semibold transition-all relative cursor-pointer select-none ${
              activeTab === "tv"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-500 after:rounded-full"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>TV Series</span>
          </button>
        </div>

        {/* Right Dropdown Filters: Country | Genre | Sort */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Country Filter */}
          <div className="relative" ref={countryDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsCountryOpen(!isCountryOpen);
                setIsGenreOpen(false);
                setIsSortOpen(false);
              }}
              className="font-custom1 inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#141720] hover:bg-[#1c212d] border border-white/10 text-xs sm:text-sm font-medium text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span
                className="truncate max-w-[130px] sm:max-w-[160px] lg:max-w-[190px]"
                title={selectedCountryLabel}
              >
                {selectedCountryLabel}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  isCountryOpen ? "rotate-180 text-emerald-400" : ""
                }`}
              />
            </button>

            {isCountryOpen && (
              <div className="absolute left-0 top-full mt-2 w-[285px] sm:w-[295px] max-w-[calc(100vw-32px)] bg-[#12151d] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1 py-0.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCountry("all");
                      setIsCountryOpen(false);
                    }}
                    className={`font-custom1 w-full text-left px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCountry === "all"
                        ? "bg-white/10 text-white font-semibold"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>All Countries</span>
                    {selectedCountry === "all" && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                  {countries.map((c) => {
                    const isSelected = selectedCountry === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c.code);
                          setIsCountryOpen(false);
                        }}
                        title={c.name}
                        className={`font-custom1 w-full text-left px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-white/10 text-white font-semibold"
                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Genre Filter */}
          <div className="relative" ref={genreDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsGenreOpen(!isGenreOpen);
                setIsCountryOpen(false);
                setIsSortOpen(false);
              }}
              className="font-custom1 inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#141720] hover:bg-[#1c212d] border border-white/10 text-xs sm:text-sm font-medium text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span className="truncate max-w-[110px] sm:max-w-[130px]">
                {selectedGenreLabel}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isGenreOpen ? "rotate-180 text-emerald-400" : ""
                  }`}
              />
            </button>

            {isGenreOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-32px)] bg-[#12151d] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1 py-0.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGenre("all");
                      setIsGenreOpen(false);
                    }}
                    className={`font-custom1 w-full text-left px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${selectedGenre === "all"
                        ? "bg-white/10 text-white font-semibold"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <span>All Genres</span>
                    {selectedGenre === "all" && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                  {genres.map((g) => {
                    const isSelected = selectedGenre === String(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGenre(String(g.id));
                          setIsGenreOpen(false);
                        }}
                        className={`font-custom1 w-full text-left px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${isSelected
                            ? "bg-white/10 text-white font-semibold"
                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <span>{g.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sort Filter (Matching the open dropdown style in UI reference image) */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsCountryOpen(false);
                setIsGenreOpen(false);
              }}
              className="font-custom1 inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#141720] hover:bg-[#1c212d] border border-white/10 text-xs sm:text-sm font-medium text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>{selectedSortLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isSortOpen ? "rotate-180 text-emerald-400" : ""
                  }`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-48 max-w-[calc(100vw-32px)] bg-[#12151d] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="py-0.5 space-y-0.5">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = selectedSort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedSort(opt.value);
                          setIsSortOpen(false);
                        }}
                        className={`font-custom1 w-full text-left px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${isSelected
                            ? "bg-white/10 text-white font-semibold"
                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
              Something went wrong.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Please check your connection and try again.
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
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
            <Film className="w-6 h-6 opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              No movies or TV series found.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Try adjusting your filters or search criteria.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="font-custom1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm font-semibold text-black transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Filters</span>
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
                  : item.type;

              return (
                <Link
                  key={`${item.type}-${item.id}-${index}`}
                  href={href}
                  className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151d] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/80 block"
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

          {/* Pagination Controls: [ − Less ] and [ + More ] */}
          <div className="flex items-center justify-center gap-3 pt-8 pb-4">
            {/* "- Less" Button: Displayed when page > 1 (e.g. 40, 60 items) */}
            {items.length > 20 && (
              <button
                type="button"
                onClick={handleLess}
                className="font-custom1 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#141720] hover:bg-[#1e2330] border border-white/10 text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <Minus className="w-4 h-4" />
                <span>Less</span>
              </button>
            )}

            {/* "+ More" Button (Show more) */}
            {hasMore && (
              <button
                type="button"
                onClick={handleMore}
                disabled={isLoadingMore}
                className="font-custom1 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] border border-white/10 text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{isLoadingMore ? "Loading..." : "More"}</span>
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
