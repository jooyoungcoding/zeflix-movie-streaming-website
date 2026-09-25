"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  Film,
  MapPin,
  RefreshCw,
  Search,
  Star,
  Tv,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import PersonSkeletonLoading from "./PersonSkeletonLoading";
import {
  PersonFilmographyData,
  PersonCredit,
} from "@/domain/person/person.types";
import { fetchPersonDetail } from "@/features/person/api/person.api";
import { groupCreditsByYearAndMonth } from "@/features/person/service/person.service";

interface PersonDetailViewProps {
  personId: string;
  initialData?: PersonFilmographyData | null;
}

type MediaTypeFilter = "all" | "movie" | "tv";

export default function PersonDetailView({
  personId,
  initialData,
}: PersonDetailViewProps) {
  // Main data state
  const [data, setData] = useState<PersonFilmographyData | null>(
    initialData || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all");

  // Biography expand toggle
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);

  // Year Dropdown state
  const [isYearOpen, setIsYearOpen] = useState<boolean>(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic years list: all years that this cast member has credits for (descending)
  const yearsList = useMemo(() => {
    if (!data?.allCredits) return [];
    const yearsSet = new Set<number>();
    data.allCredits.forEach((credit) => {
      if (credit.year !== null) {
        yearsSet.add(credit.year);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [data]);

  // Load person details from client API if not provided as initialData
  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchPersonDetail(personId)
      .then((res) => setData(res))
      .catch((err) => {
        console.error("[PersonDetailView] Fetch error:", err);
        if (err instanceof Error && err.message === "PERSON_NOT_FOUND") {
          setError("Person not found.");
        } else {
          setError("Unable to load person details.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [personId]);

  useEffect(() => {
    let isMounted = true;
    if (!initialData) {
      fetchPersonDetail(personId)
        .then((res) => {
          if (isMounted) setData(res);
        })
        .catch((err) => {
          if (isMounted) {
            console.error("[PersonDetailView] Fetch error:", err);
            if (err instanceof Error && err.message === "PERSON_NOT_FOUND") {
              setError("Person not found.");
            } else {
              setError("Unable to load person details.");
            }
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [initialData, personId]);

  // Close year dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter credits according to: mediaTypeFilter, searchQuery, selectedYear
  const filteredCredits = useMemo(() => {
    if (!data?.allCredits) return [];

    return data.allCredits.filter((credit) => {
      // 1. Media Type Filter
      if (mediaTypeFilter === "movie" && credit.mediaType !== "movie") {
        return false;
      }
      if (mediaTypeFilter === "tv" && credit.mediaType !== "tv") {
        return false;
      }

      // 2. Year Filter
      if (selectedYear !== "all" && credit.year !== selectedYear) {
        return false;
      }

      // 3. Search Filter (by movie / TV title, case-insensitive)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = credit.title.toLowerCase().includes(query);
        const matchesCharacter = credit.character.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCharacter) {
          return false;
        }
      }

      return true;
    });
  }, [data, mediaTypeFilter, selectedYear, searchQuery]);

  // Chronologically group the filtered credits
  const {
    upcomingGroups,
    recentlyReleasedGroups,
    fullFilmographyGroups,
    unknownDateCredits,
  } = useMemo(() => {
    const upcoming = filteredCredits.filter((c) => c.isUpcoming);
    const recently = filteredCredits.filter((c) => c.isRecentlyReleased);
    const historical = filteredCredits.filter(
      (c) => !c.isUpcoming && c.year !== null
    );
    const unknown = filteredCredits.filter((c) => c.year === null);

    return {
      upcomingGroups: groupCreditsByYearAndMonth(upcoming),
      recentlyReleasedGroups: groupCreditsByYearAndMonth(recently),
      fullFilmographyGroups: groupCreditsByYearAndMonth(historical),
      unknownDateCredits: unknown,
    };
  }, [filteredCredits]);

  // Format birthday with age
  const formattedBirthday = useMemo(() => {
    if (!data?.person.birthday) return null;
    const date = new Date(data.person.birthday);
    if (isNaN(date.getTime())) return data.person.birthday;

    const formatted = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (data.person.deathday) {
      return formatted;
    }

    // Calculate age
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < date.getDate())
    ) {
      age--;
    }
    return `${formatted} (Age ${age})`;
  }, [data]);

  // Loading state
  if (isLoading) {
    return <PersonSkeletonLoading />;
  }

  // Error state / Not found
  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#07090e] text-white flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full text-center p-8 rounded-2xl bg-[#0f1219] space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {error || "Person not found."}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            We couldn&apos;t retrieve information for this person. Please check the URL or try again.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <BackButton fallbackUrl="/" label="Back" />
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { person, knownFor } = data;
  const hasBiography = Boolean(person.biography && person.biography.trim().length > 0);
  const bioIsLong = hasBiography && person.biography.length > 380;
  const displayedBio =
    hasBiography && bioIsLong && !isBioExpanded
      ? `${person.biography.slice(0, 380).trim()}...`
      : person.biography;

  const hasAnyFilmographyResults = filteredCredits.length > 0;
  const isFiltersActive =
    searchQuery.trim().length > 0 ||
    selectedYear !== "all" ||
    mediaTypeFilter !== "all";

  // Reusable Release Card renderer
  const renderReleaseCard = (credit: PersonCredit, index: number) => {
    const detailHref =
      credit.mediaType === "tv" ? `/tv/${credit.id}` : `/movies/${credit.id}`;

    return (
      <Link
        key={`${credit.mediaType}-${credit.id}-${index}`}
        href={detailHref}
        className="group relative flex items-center gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-2xl bg-[#07090e] hover:bg-[#0d1017] transition-all duration-300 hover:translate-y-[-1px] select-none cursor-pointer overflow-hidden"
      >
        {/* 1. Circular Date Badge */}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-black font-extrabold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(255,255,255,0.25)] select-none"
          title={credit.releaseDate || "Release"}
        >
          {credit.day !== null
            ? credit.day
            : credit.month !== null
              ? credit.month + 1
              : "—"}
        </div>

        {/* 2. Poster Thumbnail */}
        <div className="relative w-16 h-22 sm:w-18 sm:h-26 rounded-xl overflow-hidden shrink-0 bg-[#161a24] shadow-sm">
          {credit.poster ? (
            <Image
              src={credit.poster}
              alt={credit.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/80 text-[10px] text-zinc-400 p-1 text-center">
              <Film className="w-4 h-4 mb-1 text-zinc-500" />
              <span>No Poster</span>
            </div>
          )}
        </div>

        {/* 3. Content Details */}
        <div className="flex-1 min-w-0 pr-1 space-y-1.5">
          <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors truncate">
            {credit.title}
          </h3>

          {/* Role / Character & Rating */}
          <div className="text-xs text-zinc-400 truncate flex items-center gap-2">
            {credit.character ? (
              <span className="truncate text-zinc-300">
                as <span className="font-medium text-white">{credit.character}</span>
              </span>
            ) : (
              <span>Actor</span>
            )}
            {credit.rating > 0 && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="inline-flex items-center gap-1 text-amber-400 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{credit.rating.toFixed(1)}</span>
                </span>
              </>
            )}
          </div>

          {/* Badges: Type on top/left, Status on right */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-zinc-300 uppercase tracking-wider font-custom2">
              {credit.mediaType === "tv" ? "TV Series" : "Movies"}
            </span>

            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-custom2"
              style={{
                backgroundColor: "#000000",
                color: credit.isUpcoming ? "#34d399" : "#d4d4d8",
              }}
            >
              {credit.status}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-white pb-24">
      {/* 1. HERO HEADER */}
      <section className="relative pt-24 sm:pt-32 pb-10 sm:pb-14 overflow-hidden bg-gradient-to-b from-[#10141f]/70 via-[#07090e]/80 to-[#07090e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Back button */}
          <div>
            <BackButton fallbackUrl="/" label="Back" />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 pt-2">
            {/* Profile Avatar */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden bg-[#161a24] shrink-0 shadow-2xl">
              {person.avatar ? (
                <Image
                  src={person.avatar}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-800">
                  <User className="w-16 h-16 sm:w-20 sm:h-20" />
                  <span className="text-xs text-zinc-400 mt-2">No Photo</span>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left">
              {/* Full Name */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight font-custom1 drop-shadow-md">
                {person.name}
              </h1>

              {/* Department & Metadata Chips */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                {person.knownForDepartment && (
                  <span className="inline-flex items-center px-3 py-1 rounded-xl bg-white/10 text-zinc-200 font-medium">
                    {person.knownForDepartment}
                  </span>
                )}

                {formattedBirthday && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{formattedBirthday}</span>
                  </span>
                )}

                {person.placeOfBirth && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate max-w-[220px] sm:max-w-xs">
                      {person.placeOfBirth}
                    </span>
                  </span>
                )}
              </div>

              {/* Biography (Only displayed if non-empty) */}
              {hasBiography && (
                <div className="space-y-2 pt-2 max-w-3xl">
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                    {displayedBio}
                  </p>
                  {bioIsLong && (
                    <button
                      type="button"
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer select-none"
                    >
                      {isBioExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. KNOWN FOR SECTION */}
      {knownFor && knownFor.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 sm:space-y-5">
          <div className="flex items-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-custom2">
              Known For
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {knownFor.map((item, idx) => {
              const href =
                item.mediaType === "tv" ? `/tv/${item.id}` : `/movies/${item.id}`;

              return (
                <Link
                  key={`${item.mediaType}-${item.id}-${idx}`}
                  href={href}
                  className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151d] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/80 block select-none cursor-pointer"
                >
                  {/* Poster Image */}
                  {item.poster ? (
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                      No Poster
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Metadata at Bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-10 space-y-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate drop-shadow">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 drop-shadow">
                      {item.rating > 0 && (
                        <>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="font-semibold text-white">
                            {item.rating.toFixed(1)}
                          </span>
                          <span className="text-zinc-500">•</span>
                        </>
                      )}
                      <span className="truncate">
                        {item.mediaType === "tv" ? "TV Series" : "Movie"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. FILMOGRAPHY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">
        {/* Filtering Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Media Type Tabs: [ All ] [ Movies ] [ TV Shows ] */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMediaTypeFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${mediaTypeFilter === "all"
                  ? "bg-white text-black shadow-md"
                  : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setMediaTypeFilter("movie")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${mediaTypeFilter === "movie"
                  ? "bg-white text-black shadow-md"
                  : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaTypeFilter("tv")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${mediaTypeFilter === "tv"
                  ? "bg-white text-black shadow-md"
                  : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Shows</span>
            </button>
          </div>

          {/* Filter Tools: Search + Year Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Search input by movie/TV title */}
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies or series..."
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#11141c] hover:bg-[#181c26] focus:bg-[#1c212d] text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Year Dropdown: All Years -> current down to 2000 */}
            <div
              className={`relative ${isYearOpen ? "z-50" : "z-20"} shrink-0`}
              ref={yearDropdownRef}
            >
              <button
                type="button"
                onClick={() => setIsYearOpen(!isYearOpen)}
                className={`w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${isYearOpen
                    ? "bg-[#1c212d] text-white shadow-lg"
                    : "bg-[#11141c] hover:bg-[#181c26] text-zinc-200"
                  }`}
                aria-haspopup="listbox"
                aria-expanded={isYearOpen}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {selectedYear === "all" ? "All Years" : selectedYear}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${isYearOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                />
              </button>

              {/* Year Dropdown Menu */}
              {isYearOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#121620] rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear("all");
                        setIsYearOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${selectedYear === "all"
                          ? "text-emerald-400 font-semibold"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <span>All Years</span>
                      {selectedYear === "all" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>

                    {yearsList.map((y) => {
                      const isSelected = selectedYear === y;
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => {
                            setSelectedYear(y);
                            setIsYearOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${isSelected
                              ? "text-emerald-400 font-semibold"
                              : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          <span>{y}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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

        {/* Empty State when no results match filters */}
        {!hasAnyFilmographyResults && (
          <div className="my-16 max-w-md mx-auto text-center p-8 rounded-2xl bg-[#0f1219] space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mx-auto">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {isFiltersActive
                ? "No movies or series found."
                : "No filmography available."}
            </h3>
            {isFiltersActive && (
              <p className="text-xs sm:text-sm text-zinc-400">
                Try adjusting your search query or selecting another year.
              </p>
            )}
            {isFiltersActive && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedYear("all");
                  setMediaTypeFilter("all");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* 3.A UPCOMING PROJECTS */}
        {upcomingGroups.length > 0 && (
          <div className="space-y-8 pt-2">
            <div className="flex items-center">
              <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-white font-custom2">
                Upcoming
              </h3>
            </div>

            <div className="space-y-8 sm:space-y-10">
              {upcomingGroups.map((yearGroup) => (
                <div key={`upcoming-${yearGroup.year}`} className="space-y-6">
                  {yearGroup.months.map((monthGroup) => (
                    <div
                      key={`upcoming-${yearGroup.year}-${monthGroup.month}`}
                      className="space-y-3.5"
                    >
                      {/* Year stands before month, separated by dot, both in white */}
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg sm:text-xl font-bold text-white font-custom2">
                          {yearGroup.year}
                        </span>
                        <span className="text-zinc-500 font-bold">•</span>
                        <h4 className="text-lg sm:text-xl font-bold text-white font-custom2">
                          {monthGroup.monthName}
                        </h4>
                      </div>

                      {/* Cards Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
                        {monthGroup.credits.map((credit, idx) =>
                          renderReleaseCard(credit, idx)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3.B RECENTLY RELEASED PROJECTS */}
        {recentlyReleasedGroups.length > 0 && (
          <div className="space-y-8 pt-4">
            <div className="flex items-center">
              <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-white font-custom2">
                Recently Released
              </h3>
            </div>

            <div className="space-y-8 sm:space-y-10">
              {recentlyReleasedGroups.map((yearGroup) => (
                <div key={`recent-${yearGroup.year}`} className="space-y-6">
                  {yearGroup.months.map((monthGroup) => (
                    <div
                      key={`recent-${yearGroup.year}-${monthGroup.month}`}
                      className="space-y-3.5"
                    >
                      {/* Year stands before month, separated by dot, both in white */}
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg sm:text-xl font-bold text-white font-custom2">
                          {yearGroup.year}
                        </span>
                        <span className="text-zinc-500 font-bold">•</span>
                        <h4 className="text-lg sm:text-xl font-bold text-white font-custom2">
                          {monthGroup.monthName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
                        {monthGroup.credits.map((credit, idx) =>
                          renderReleaseCard(credit, idx)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3.C FULL HISTORICAL FILMOGRAPHY */}
        {fullFilmographyGroups.length > 0 && (
          <div className="space-y-8 pt-4">
            <div className="flex items-center">
              <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-white font-custom2">
                Filmography
              </h3>
            </div>

            <div className="space-y-8 sm:space-y-10">
              {fullFilmographyGroups.map((yearGroup) => (
                <div key={`full-${yearGroup.year}`} className="space-y-6">
                  {yearGroup.months.map((monthGroup) => (
                    <div
                      key={`full-${yearGroup.year}-${monthGroup.month}`}
                      className="space-y-3.5"
                    >
                      {/* Year stands before month, separated by dot, both in white */}
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg sm:text-xl font-bold text-white font-custom2">
                          {yearGroup.year}
                        </span>
                        <span className="text-zinc-500 font-bold">•</span>
                        <h4 className="text-lg sm:text-xl font-bold text-white font-custom2">
                          {monthGroup.monthName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
                        {monthGroup.credits.map((credit, idx) =>
                          renderReleaseCard(credit, idx)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3.D UNKNOWN RELEASE DATE GROUP */}
        {unknownDateCredits.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center">
              <h3 className="text-lg sm:text-xl font-bold tracking-wide text-zinc-400 font-custom2">
                Unknown Release Date
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 pl-1 sm:pl-3">
              {unknownDateCredits.map((credit, idx) =>
                renderReleaseCard(credit, idx)
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
