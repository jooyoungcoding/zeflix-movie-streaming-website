"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";

export type MediaType = "movie" | "tv";

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
  { id: "france", label: "France", adjective: "French" },
  { id: "china", label: "China", adjective: "Chinese" },
];

export interface MediaItem {
  id: string;
  title: string;
  rating: string;
  genre: string;
  type: string;
  mediaType: MediaType;
  country: string; // 'us' | 'korea' | 'japan' | 'uk' | 'france' | 'china'
  backdrop: string;
  href?: string;
}

export const countryMediaData: MediaItem[] = [
  // --- KOREA ---
  {
    id: "k-s1",
    title: "Toxic",
    rating: "4.6",
    genre: "Action",
    type: "Series",
    mediaType: "tv",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/m8JTwjd0NM2PAYYKDvCuWmuQIP5.jpg",
    href: "/watch/toxic",
  },
  {
    id: "k-s2",
    title: "Insider",
    rating: "4.6",
    genre: "Action",
    type: "Series",
    mediaType: "tv",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    href: "/watch/insider",
  },
  {
    id: "k-s3",
    title: "Race Season 1",
    rating: "4.6",
    genre: "Action",
    type: "Series",
    mediaType: "tv",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    href: "/watch/race",
  },
  {
    id: "k-s4",
    title: "Ghost Doctor",
    rating: "4.6",
    genre: "Action",
    type: "Series",
    mediaType: "tv",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/bKxiLRP0Qm2JwLs09vSbg094Xzc.jpg",
    href: "/watch/ghost-doctor",
  },
  {
    id: "k-s5",
    title: "The Pirates: The Last Royal Treasure",
    rating: "4.6",
    genre: "Action",
    type: "Series",
    mediaType: "tv",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",
    href: "/watch/the-pirates",
  },
  {
    id: "k-s6",
    title: "All of Us Are Dead",
    rating: "4.8",
    genre: "Horror",
    type: "Series",
    mediaType: "tv",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/xRw3akJQdfgqx0x4fiHW7nIkEUJ.jpg",
    href: "/watch/all-of-us-are-dead",
  },
  {
    id: "k-m1",
    title: "Parasite",
    rating: "4.9",
    genre: "Thriller",
    type: "Movie",
    mediaType: "movie",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/hiKmpZMGZsrkA3cdFiR26wpos6n.jpg",
    href: "/watch/parasite",
  },
  {
    id: "k-m2",
    title: "Train to Busan",
    rating: "4.8",
    genre: "Action",
    type: "Movie",
    mediaType: "movie",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/5A26bZ8p7iXjG8V3bQkC6vD6R0Y.jpg",
    href: "/watch/train-to-busan",
  },
  {
    id: "k-m3",
    title: "The Roundup: No Way Out",
    rating: "4.7",
    genre: "Crime",
    type: "Movie",
    mediaType: "movie",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/b8c61WQx9RVF9hDk8Pq63kinbHu.jpg",
    href: "/watch/the-roundup",
  },
  {
    id: "k-m4",
    title: "Decision to Leave",
    rating: "4.7",
    genre: "Mystery",
    type: "Movie",
    mediaType: "movie",
    country: "korea",
    backdrop: "https://image.tmdb.org/t/p/w500/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    href: "/watch/decision-to-leave",
  },

  // --- US ---
  {
    id: "us-m1",
    title: "Oppenheimer",
    rating: "4.9",
    genre: "Biography",
    type: "Movie",
    mediaType: "movie",
    country: "us",
    backdrop: "https://image.tmdb.org/t/p/w500/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    href: "/watch/oppenheimer",
  },
  {
    id: "us-m2",
    title: "Dune: Part Two",
    rating: "4.9",
    genre: "Sci-Fi",
    type: "Movie",
    mediaType: "movie",
    country: "us",
    backdrop: "https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s520bne.jpg",
    href: "/watch/dune-2",
  },
  {
    id: "us-m3",
    title: "Spider-Man: Across Spider-Verse",
    rating: "4.9",
    genre: "Animation",
    type: "Movie",
    mediaType: "movie",
    country: "us",
    backdrop: "https://image.tmdb.org/t/p/w500/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    href: "/watch/spider-man",
  },
  {
    id: "us-m4",
    title: "John Wick: Chapter 4",
    rating: "4.9",
    genre: "Action",
    type: "Movie",
    mediaType: "movie",
    country: "us",
    backdrop: "https://image.tmdb.org/t/p/w500/h8gHn0OzBoaefsYseUByqsmEDMY.jpg",
    href: "/watch/john-wick-4",
  },
  {
    id: "us-s1",
    title: "Stranger Things Season 4",
    rating: "4.9",
    genre: "Sci-Fi",
    type: "Series",
    mediaType: "tv",
    country: "us",
    backdrop: "https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    href: "/watch/stranger-things",
  },
  {
    id: "us-s2",
    title: "The Last Of Us",
    rating: "4.8",
    genre: "Drama",
    type: "Series",
    mediaType: "tv",
    country: "us",
    backdrop: "https://image.tmdb.org/t/p/w500/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    href: "/watch/the-last-of-us",
  },
  {
    id: "us-s3",
    title: "Wednesday",
    rating: "4.7",
    genre: "Fantasy",
    type: "Series",
    mediaType: "tv",
    country: "us",
    backdrop: "https://image.tmdb.org/t/p/w500/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    href: "/watch/wednesday",
  },

  // --- JAPAN ---
  {
    id: "jp-m1",
    title: "Suzume",
    rating: "4.8",
    genre: "Anime",
    type: "Movie",
    mediaType: "movie",
    country: "japan",
    backdrop: "https://image.tmdb.org/t/p/w500/9n2tJBplPbgR2ca05hO5qX29xuv.jpg",
    href: "/watch/suzume",
  },
  {
    id: "jp-m2",
    title: "Godzilla Minus One",
    rating: "4.9",
    genre: "Sci-Fi",
    type: "Movie",
    mediaType: "movie",
    country: "japan",
    backdrop: "https://image.tmdb.org/t/p/w500/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    href: "/watch/godzilla",
  },
  {
    id: "jp-s1",
    title: "Alice in Borderland",
    rating: "4.8",
    genre: "Thriller",
    type: "Series",
    mediaType: "tv",
    country: "japan",
    backdrop: "https://image.tmdb.org/t/p/w500/bKxiLRP0Qm2JwLs09vSbg094Xzc.jpg",
    href: "/watch/alice-in-borderland",
  },
  {
    id: "jp-s2",
    title: "Demon Slayer: Swordsmith",
    rating: "4.9",
    genre: "Anime",
    type: "Series",
    mediaType: "tv",
    country: "japan",
    backdrop: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    href: "/watch/demon-slayer",
  },

  // --- UK ---
  {
    id: "uk-m1",
    title: "Enola Holmes 2",
    rating: "4.8",
    genre: "Mystery",
    type: "Movie",
    mediaType: "movie",
    country: "uk",
    backdrop: "https://image.tmdb.org/t/p/w500/tegBpjM5ODoYoM1NjaiHVLEA0QM.jpg",
    href: "/watch/enola-holmes",
  },
  {
    id: "uk-s1",
    title: "Peaky Blinders",
    rating: "4.9",
    genre: "Crime",
    type: "Series",
    mediaType: "tv",
    country: "uk",
    backdrop: "https://image.tmdb.org/t/p/w500/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    href: "/watch/peaky-blinders",
  },
  {
    id: "uk-s2",
    title: "The Crown Season 6",
    rating: "4.7",
    genre: "Drama",
    type: "Series",
    mediaType: "tv",
    country: "uk",
    backdrop: "https://image.tmdb.org/t/p/w500/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",
    href: "/watch/the-crown",
  },

  // --- FRANCE ---
  {
    id: "fr-m1",
    title: "Anatomy of a Fall",
    rating: "4.8",
    genre: "Drama",
    type: "Movie",
    mediaType: "movie",
    country: "france",
    backdrop: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    href: "/watch/anatomy-of-a-fall",
  },
  {
    id: "fr-s1",
    title: "Lupin Part 3",
    rating: "4.8",
    genre: "Mystery",
    type: "Series",
    mediaType: "tv",
    country: "france",
    backdrop: "https://image.tmdb.org/t/p/w500/m8JTwjd0NM2PAYYKDvCuWmuQIP5.jpg",
    href: "/watch/lupin",
  },

  // --- CHINA ---
  {
    id: "cn-m1",
    title: "Creation of the Gods I",
    rating: "4.7",
    genre: "Fantasy",
    type: "Movie",
    mediaType: "movie",
    country: "china",
    backdrop: "https://image.tmdb.org/t/p/w500/5YZbUmjbMa3ClvSW1Wj3D6XGolP.jpg",
    href: "/watch/creation-of-the-gods",
  },
  {
    id: "cn-s1",
    title: "Three-Body Problem",
    rating: "4.8",
    genre: "Sci-Fi",
    type: "Series",
    mediaType: "tv",
    country: "china",
    backdrop: "https://image.tmdb.org/t/p/w500/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg",
    href: "/watch/three-body",
  },
];

export default function BrowseByCountry() {
  const [selectedType, setSelectedType] = useState<MediaType>("tv");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Dynamic Section Title
  const sectionTitle = useMemo(() => {
    const currentCountry = COUNTRIES.find((c) => c.id === selectedCountry);
    const countryPrefix = currentCountry ? currentCountry.adjective : "All";
    const typeLabel = selectedType === "movie" ? "Movies" : "Series";

    if (selectedCountry === "all") {
      return selectedType === "movie" ? "All Movies" : "All Series";
    }
    return `${countryPrefix} ${typeLabel}`;
  }, [selectedCountry, selectedType]);

  // Filtered List
  const filteredList = useMemo(() => {
    return countryMediaData.filter((item) => {
      const matchType = item.mediaType === selectedType;
      const matchCountry =
        selectedCountry === "all" ? true : item.country === selectedCountry;
      return matchType && matchCountry;
    });
  }, [selectedType, selectedCountry]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [selectedType, selectedCountry]);

  useEffect(() => {
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, []);

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

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative overflow-hidden">
      {/* Top Header: Title, Toggle Media Type, See All Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {/* Section Title (Custom Font 2) */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2 transition-all duration-300">
            {sectionTitle}
          </h2>
        </div>

        {/* Right Action Controls: Toggle Movies/TV & See All */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Movies - TV Series Pill Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#161922] border border-white/10 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedType("movie")}
              className={`font-custom1 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${selectedType === "movie"
                ? "bg-[#2ca566] text-white shadow-md shadow-emerald-950/40"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              Movies
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("tv")}
              className={`font-custom1 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${selectedType === "tv"
                ? "bg-[#2ca566] text-white shadow-md shadow-emerald-950/40"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              TV Series
            </button>
          </div>

          {/* See All Button */}
          <Link
            href={selectedType === "movie" ? "/movies" : "/series"}
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

        {/* Cards Horizontal Scroll List */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 scroll-smooth snap-x px-1 min-h-[220px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <Link
                key={item.id}
                href={item.href || "#"}
                className="group shrink-0 w-[230px] sm:w-[260px] md:w-[280px] select-none cursor-pointer snap-start"
              >
                {/* Landscape Thumbnail Box */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#12151c] shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                  <Image
                    src={item.backdrop}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 230px, (max-width: 768px) 260px, 280px"
                  />
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
                    <span className="text-zinc-600">•</span>
                    <span>{item.genre}</span>
                    <span className="text-zinc-600">•</span>
                    <span>{item.type}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full py-12 flex items-center justify-center text-zinc-500 text-sm font-medium">
              No titles available for this filter
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
