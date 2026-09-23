"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronDown,
    ChevronUp,
    Calendar,
    Film,
    Star,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import {
    fetchReleases,
    fetchCountries,
} from "@/features/movie/api/release.api";
import {
    ReleaseMonthGroup,
    CountryOption,
} from "@/features/movie/movie.type";

const HERO_BACKGROUND_IMAGE = "/Images/release2.jpg";

export default function ReleasePage() {
    const currentYear = new Date().getFullYear();

    // Filter states
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedRegion, setSelectedRegion] = useState<string>("worldwide");

    // Data states
    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [months, setMonths] = useState<ReleaseMonthGroup[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleCounts, setVisibleCounts] = useState<Record<number, number>>({});

    const handleMore = (month: number) => {
        setVisibleCounts((prev) => ({
            ...prev,
            [month]: (prev[month] || 8) + 8,
        }));
    };

    const handleLess = (month: number) => {
        setVisibleCounts((prev) => ({
            ...prev,
            [month]: 8,
        }));
    };

    // Dropdown states
    const [isRegionOpen, setIsRegionOpen] = useState<boolean>(false);
    const [isYearOpen, setIsYearOpen] = useState<boolean>(false);

    const regionDropdownRef = useRef<HTMLDivElement>(null);
    const yearDropdownRef = useRef<HTMLDivElement>(null);

    // Dynamic years: current year down to 2000 descending
    const yearsList = useMemo(() => {
        const list: number[] = [];
        for (let y = currentYear; y >= 2000; y--) {
            list.push(y);
        }
        return list;
    }, [currentYear]);


    // Fetch TMDB countries on mount
    useEffect(() => {
        let isMounted = true;
        fetchCountries()
            .then((data) => {
                if (isMounted) setCountries(data);
            })
            .catch((err) => {
                console.error("Failed to load TMDB countries:", err);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const loadReleases = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetchReleases({
                year: selectedYear,
                region: selectedRegion,
            });
            setMonths(res.months || []);
            setVisibleCounts({});
        } catch (err) {
            console.error("Failed to load releases:", err);
            setError("Unable to load releases.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedRegion]);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            let isMounted = true;
            fetchReleases({
                year: selectedYear,
                region: selectedRegion,
            })
                .then((res) => {
                    if (isMounted) {
                        setMonths(res.months || []);
                        setVisibleCounts({});
                    }
                })
                .catch((err) => {
                    console.error("Failed to load releases:", err);
                    if (isMounted) setError("Unable to load releases.");
                })
                .finally(() => {
                    if (isMounted) setIsLoading(false);
                });
            return () => {
                isMounted = false;
            };
        }

        loadReleases();
    }, [loadReleases, selectedYear, selectedRegion]);

    // Handle outside click to close dropdowns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                regionDropdownRef.current &&
                !regionDropdownRef.current.contains(event.target as Node)
            ) {
                setIsRegionOpen(false);
            }
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

    // Find country human readable name
    const currentRegionName = useMemo(() => {
        if (selectedRegion.toLowerCase() === "worldwide") return "Worldwide";
        const found = countries.find(
            (c) => c.code.toLowerCase() === selectedRegion.toLowerCase()
        );
        return found ? found.name : selectedRegion.toUpperCase();
    }, [selectedRegion, countries]);

    // Dynamic subtitle based on region
    const subtitleText =
        selectedRegion.toLowerCase() === "worldwide"
            ? "Discover Movies/TV Series released around the world."
            : `Discover Movies/TV Series released in ${currentRegionName}.`;

    return (
        <main className="min-h-screen bg-[#07090e] text-white pb-24">
            {/* 1. HERO HEADER WITH MOVIE BANNER BACKGROUND */}
            <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-16 overflow-hidden min-h-[320px] sm:min-h-[400px] flex items-end">
                {/* Background Movie Artwork Collage */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="relative h-full w-full opacity-70 sm:opacity-80">
                        <Image
                            src={HERO_BACKGROUND_IMAGE}
                            alt="Movie Release Banner"
                            fill
                            className="object-cover object-center"
                            sizes="100vw"
                            priority
                        />
                    </div>
                    {/* Softened gradient overlays so the background is much brighter */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/60 via-transparent to-transparent" />
                </div>

                {/* Left-aligned Hero Content (font-custom2) */}
                <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 sm:space-y-3 z-10">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight font-custom1 drop-shadow-md">
                        <span>Release Schedule</span>
                        <span className="hidden sm:inline">
                            {" "}of<br />
                            Popular Movies all around the world
                        </span>
                    </h1>

                    <p className="text-zinc-400 text-xs sm:text-sm md:text-base font-custom2 max-w-2xl">
                        {subtitleText}
                    </p>
                </div>
            </section>

            {/* 2. TITLE SECTION & FILTER CONTROLS */}
            <section className="relative z-40 bg-[#07090e] pt-6 pb-2 sm:pt-8 sm:pb-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Section Title (font-custom2) */}
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-custom2">
                        New Releases
                    </h2>

                    {/* Filter Controls (Right) */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        {/* Region Filter Dropdown */}
                        <div className={`relative ${isRegionOpen ? "z-50" : "z-20"} flex-1 sm:flex-initial`} ref={regionDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegionOpen(!isRegionOpen);
                                    setIsYearOpen(false);
                                }}
                                className={`w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${isRegionOpen
                                    ? "bg-[#1c212d] border-emerald-500/50 text-white shadow-lg"
                                    : "bg-[#11141c] hover:bg-[#181c26] border-white/10 hover:border-white/20 text-zinc-200"
                                    } border`}
                                aria-haspopup="listbox"
                                aria-expanded={isRegionOpen}
                            >
                                <span className="truncate max-w-[130px] sm:max-w-[170px]">{currentRegionName}</span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${isRegionOpen ? "rotate-180 text-emerald-400" : ""
                                        }`}
                                />
                            </button>

                            {/* Region Options Menu */}
                            {isRegionOpen && (
                                <div className="absolute left-0 sm:right-auto mt-2 w-64 sm:w-72 bg-[#121620] border border-white/15 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    {/* Options List */}
                                    <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
                                        {/* Worldwide Option */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedRegion("worldwide");
                                                setIsRegionOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${selectedRegion.toLowerCase() === "worldwide"
                                                ? "text-emerald-400 font-semibold"
                                                : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            <span>Worldwide</span>
                                            {selectedRegion.toLowerCase() === "worldwide" && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            )}
                                        </button>

                                        {/* All TMDB Countries */}
                                        {countries.map((c) => {
                                            const isSelected =
                                                selectedRegion.toLowerCase() === c.code.toLowerCase();
                                            return (
                                                <button
                                                    key={c.code}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedRegion(c.code);
                                                        setIsRegionOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${isSelected
                                                        ? "text-emerald-400 font-semibold"
                                                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                                        }`}
                                                >
                                                    <span className="truncate pr-2">{c.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Year Filter Dropdown */}
                        <div className={`relative ${isYearOpen ? "z-50" : "z-20"} flex-1 sm:flex-initial`} ref={yearDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsYearOpen(!isYearOpen);
                                    setIsRegionOpen(false);
                                }}
                                className={`w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${isYearOpen
                                    ? "bg-[#1c212d] border-emerald-500/50 text-white shadow-lg"
                                    : "bg-[#11141c] hover:bg-[#181c26] border-white/10 hover:border-white/20 text-zinc-200"
                                    } border`}
                                aria-haspopup="listbox"
                                aria-expanded={isYearOpen}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>{selectedYear}</span>
                                </div>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${isYearOpen ? "rotate-180 text-emerald-400" : ""
                                        }`}
                                />
                            </button>

                            {/* Year Options Menu */}
                            {isYearOpen && (
                                <div className="absolute right-0 mt-2 w-36 bg-[#121620] border border-white/15 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
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
            </section>

            {/* 3. RELEASE SCHEDULE CONTENT */}
            <section className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="space-y-12">
                        {[1, 2].map((sIndex) => (
                            <div key={sIndex} className="space-y-4">
                                <div className="h-8 w-44 bg-white/10 rounded-lg animate-pulse" />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-[#07090e] animate-pulse"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-white/15 shrink-0" />
                                            <div className="w-16 h-24 rounded-xl bg-white/10 shrink-0" />
                                            <div className="flex-1 space-y-2.5">
                                                <div className="w-3/4 h-5 bg-white/10 rounded-md" />
                                                <div className="w-1/2 h-3.5 bg-white/5 rounded-md" />
                                                <div className="w-20 h-5 bg-white/10 rounded-md" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                    <div className="my-16 max-w-md mx-auto text-center p-8 rounded-2xl bg-[#0f1219] border border-white/10 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Unable to load releases.</h3>
                        <p className="text-xs sm:text-sm text-zinc-400">
                            Please check your connection or try again.
                        </p>
                        <button
                            onClick={loadReleases}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/30"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && months.length === 0 && (
                    <div className="my-16 max-w-md mx-auto text-center p-8 rounded-2xl bg-[#0f1219] border border-white/10 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center mx-auto">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                            No releases found for this selection.
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400">
                            Try selecting Worldwide or choosing another year to discover movies.
                        </p>
                        <button
                            onClick={() => {
                                setSelectedRegion("worldwide");
                                setSelectedYear(currentYear);
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer border border-white/10"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Month Sections (Sorted descending: latest to earliest) */}
                {!isLoading && !error && months.length > 0 && (
                    <div className="space-y-12 sm:space-y-14">
                        {months.map((monthGroup) => (
                            <section key={monthGroup.month} className="space-y-4 sm:space-y-5">
                                {/* Month Heading */}
                                <div className="flex items-center pb-2">
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-white font-custom2">
                                        {monthGroup.name}
                                    </h2>
                                </div>

                                {/* 2-Column Desktop Grid / 1-Column Mobile Layout */}
                                {(() => {
                                    const currentLimit = visibleCounts[monthGroup.month] || 8;
                                    const visibleReleases = monthGroup.releases.slice(0, currentLimit);
                                    const hasMore = currentLimit < monthGroup.releases.length;
                                    const canCollapse = currentLimit > 8;

                                    return (
                                        <>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
                                                {visibleReleases.map((movie) => {
                                                    const detailHref =
                                                        movie.mediaType === "tv"
                                                            ? `/tv/${movie.id}`
                                                            : `/movie/${movie.id}`;

                                                    return (
                                                        <Link
                                                            key={`${movie.mediaType}-${movie.id}`}
                                                            href={detailHref}
                                                            className="group relative flex items-center gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-2xl bg-[#07090e] hover:bg-[#0d1017] transition-all duration-300 hover:translate-y-[-1px] select-none cursor-pointer overflow-hidden"
                                                        >
                                                            {/* 1. Circular Date Badge */}
                                                            <div
                                                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-black font-extrabold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(255,255,255,0.25)] select-none"
                                                                title={`Day ${movie.day}`}
                                                            >
                                                                {movie.day}
                                                            </div>

                                                            {/* 2. Poster Thumbnail */}
                                                            <div className="relative w-16 h-22 sm:w-18 sm:h-26 rounded-xl overflow-hidden shrink-0 bg-[#161a24] shadow-sm">
                                                                {movie.poster ? (
                                                                    <Image
                                                                        src={movie.poster}
                                                                        alt={movie.title}
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
                                                                {/* Title (with S?? E?? if TV series) */}
                                                                <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors truncate">
                                                                    {movie.title}
                                                                    {movie.mediaType === "tv" && movie.seasonInfo && (
                                                                        <span className="text-zinc-400 font-medium text-xs sm:text-sm ml-1.5">
                                                                            ({movie.seasonInfo})
                                                                        </span>
                                                                    )}
                                                                </h3>

                                                                {/* Genres +N and rating (if available) */}
                                                                <div className="text-xs text-zinc-400 truncate flex items-center gap-2">
                                                                    {movie.genres.length > 0 && (
                                                                        <span>
                                                                            {movie.genres[0]}
                                                                            {movie.genres.length > 1 && ` +${movie.genres.length - 1}`}
                                                                        </span>
                                                                    )}
                                                                    {movie.voteAverage > 0 && (
                                                                        <>
                                                                            {movie.genres.length > 0 && (
                                                                                <span className="text-zinc-600">•</span>
                                                                            )}
                                                                            <span className="inline-flex items-center gap-1 text-amber-400">
                                                                                <Star className="w-3 h-3 fill-amber-400" />
                                                                                <span>{movie.voteAverage.toFixed(1)}</span>
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Badges: Type on top, Status below (font-custom2) */}
                                                                <div className="flex flex-col items-start gap-1 pt-0.5">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-zinc-300 uppercase tracking-wider font-custom2">
                                                                        {movie.mediaType === "tv" ? "TV Series" : "Movies"}
                                                                    </span>

                                                                    <span
                                                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-custom2"
                                                                        style={{
                                                                            backgroundColor: "#000000",
                                                                            borderColor: "#52525b",
                                                                            color: "#d4d4d8",
                                                                            borderWidth: "0.5px",
                                                                            borderStyle: "solid",
                                                                        }}
                                                                    >
                                                                        {movie.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>

                                            {/* More / Less Button when month has more than 8 releases */}
                                            {monthGroup.releases.length > 8 && (
                                                <div className="flex items-center justify-center gap-3 pt-2">
                                                    {hasMore && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMore(monthGroup.month)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer font-custom2"
                                                        >
                                                            <span>More</span>
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {canCollapse && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleLess(monthGroup.month)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer font-custom2"
                                                        >
                                                            <span>Less</span>
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </section>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
