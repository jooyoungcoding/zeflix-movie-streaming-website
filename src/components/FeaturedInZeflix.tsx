"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play,
  Bookmark,
  Star,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

export interface FeaturedMovie {
  id: string;
  tag: string;
  title: string;
  rating: string;
  duration: string;
  year: string;
  genres: string[];
  certificate: string;
  description: string;
  poster: string;
  backdrop: string;
  trailerUrl?: string;
  href?: string;
}

export const featuredMovies: FeaturedMovie[] = [
  {
    id: "1",
    tag: "#1 in Australia",
    title: "Air Courting A Legend",
    rating: "4.6",
    duration: "2h40m",
    year: "2022",
    genres: ["Fantasy", "Actions"],
    certificate: "PG-13",
    description:
      "When international arms dealer and criminal mastermind Elena Federova orchestrates seven simultaneous New York City bank heists, principled and relentless agent Val Turner vows to take her down. An outcast in the bureau, Val soon learns that she'll have to...",
    poster: "https://image.tmdb.org/t/p/w500/76AKQPdH3M8cvsFR9K8JsOzVlY5.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",
    href: "/watch/air",
  },
  {
    id: "2",
    tag: "#1 in Global Trending",
    title: "The Last Of Us",
    rating: "4.8",
    duration: "1h00m",
    year: "2023",
    genres: ["Horror", "Thriller", "Action"],
    certificate: "TV-MA",
    description:
      "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey.",
    poster: "https://image.tmdb.org/t/p/w500/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    href: "/watch/the-last-of-us",
  },
  {
    id: "3",
    tag: "#1 in Sci-Fi",
    title: "Dune: Part Two",
    rating: "4.9",
    duration: "2h46m",
    year: "2024",
    genres: ["Sci-Fi", "Adventure"],
    certificate: "PG-13",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520bne.jpg",
    href: "/watch/dune-2",
  },
  {
    id: "4",
    tag: "#1 in Oscar Winners",
    title: "Oppenheimer",
    rating: "4.9",
    duration: "3h00m",
    year: "2023",
    genres: ["Biography", "Drama", "History"],
    certificate: "R",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral complexities and global aftermath of the Manhattan Project.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    href: "/watch/oppenheimer",
  },
  {
    id: "5",
    tag: "#1 in Animation",
    title: "Spider-Man: Across Spider-Verse",
    rating: "4.9",
    duration: "2h20m",
    year: "2023",
    genres: ["Animation", "Action", "Sci-Fi"],
    certificate: "PG",
    description:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    href: "/watch/spider-man-spider-verse",
  },
];

export default function FeaturedInZeflix() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const currentMovie = featuredMovies[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length
    );
  };

  const toggleFavorite = (movie: FeaturedMovie) => {
    const isAdded = !!favorites[movie.id];
    setFavorites((prev) => ({
      ...prev,
      [movie.id]: !isAdded,
    }));

    if (!isAdded) {
      toast.success(`Added "${movie.title}" to Watchlist!`, {
        id: `watchlist-${movie.id}`,
        icon: "🔖",
        duration: 2500,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    } else {
      toast(`Removed "${movie.title}" from Watchlist`, {
        id: `watchlist-${movie.id}`,
        icon: "🗑️",
        duration: 2000,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    }
  };

  return (
    <section className="w-full relative min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] overflow-hidden border-none my-4 sm:my-8 flex flex-col justify-between">
      {/* Full-Screen Dynamic Background Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          key={currentMovie.id}
          src={currentMovie.backdrop}
          alt={currentMovie.title}
          fill
          priority
          className="object-cover object-center scale-105 animate-fade-in transition-all duration-700 brightness-[0.38]"
          sizes="100vw"
        />
        {/* Top Edge Seamless Fade to Solid Black (Removes Any Horizontal Edge) */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-black via-black/50 to-transparent" />
        {/* Left Side Shadow for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent lg:w-[68%]" />
        {/* Bottom Edge Fade to Black */}
        <div className="absolute bottom-0 inset-x-0 h-36 sm:h-44 bg-gradient-to-t from-black via-black/80 to-transparent" />
        {/* Subtle Emerald Cinematic Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />
      </div>

      {/* Content Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-14 flex flex-col flex-1 justify-between">
        {/* Top Section Header (At the very top of background) */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-custom2">
            Featured in Zeflix
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-custom2 mt-1 font-medium tracking-wide">
            Best featured for you today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Movie Info (Appears Below Carousel on Mobile/Tablet via order-2) */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start space-y-3.5 sm:space-y-4 lg:space-y-5">
            {/* Tag Badge */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-xs font-semibold tracking-wide">
              <span>{currentMovie.tag}</span>
            </div>

            {/* Title */}
            <h3
              key={`title-${currentMovie.id}`}
              className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight animate-hero-title"
            >
              {currentMovie.title}
            </h3>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium text-zinc-300">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{currentMovie.rating}</span>
              </div>

              <span className="text-zinc-500">•</span>
              <span>{currentMovie.duration}</span>

              <span className="text-zinc-500">•</span>
              <span>{currentMovie.year}</span>

              {currentMovie.genres.map((genre) => (
                <React.Fragment key={genre}>
                  <span className="text-zinc-500">•</span>
                  <span className="text-emerald-400 font-medium">{genre}</span>
                </React.Fragment>
              ))}

              <span className="text-zinc-500">•</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[11px] font-semibold">
                {currentMovie.certificate}
              </span>
            </div>

            {/* Description */}
            <p
              key={`desc-${currentMovie.id}`}
              className="text-zinc-300/90 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-2xl animate-hero-desc"
            >
              {currentMovie.description}
            </p>

            {/* Action Buttons (Full width 2-column grid on mobile, flex on sm/desktop) */}
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center sm:gap-4 pt-1 sm:pt-2">
              {/* Play Now Button */}
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3 rounded-xl bg-[#2ca566] hover:bg-emerald-500 active:scale-95 text-white font-custom1 text-sm sm:text-base font-bold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Now</span>
              </button>

              {/* Add Watchlist Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(currentMovie)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 sm:px-6 py-3 rounded-xl bg-[#20242e]/90 hover:bg-[#2a303d] active:scale-95 text-white font-custom1 text-sm sm:text-base font-semibold tracking-wide border border-white/10 backdrop-blur-md transition-all duration-200 cursor-pointer truncate group/fav"
              >
                {favorites[currentMovie.id] ? (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400 stroke-yellow-400 transition-transform duration-300 scale-110 shrink-0" />
                    <span className="truncate">Added to Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2] text-white transition-all duration-200 group-hover/fav:text-yellow-400 group-hover/fav:scale-110 shrink-0" />
                    <span className="truncate">Add Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Posters Carousel (Appears Above Movie Info on Mobile/Tablet via order-1) */}
          <div className="order-1 lg:order-2 lg:col-span-5 relative flex items-center justify-start lg:justify-end py-1 w-full overflow-hidden">
            {/* Carousel Viewport with desktop dynamic sliding mask */}
            <div
              className={`relative w-full sm:w-[410px] lg:w-[436px] overflow-hidden py-2 px-1 transition-all duration-300 ${activeIndex > 0 && activeIndex < featuredMovies.length - 1
                  ? "lg:[mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_86%,transparent_100%)]"
                  : activeIndex > 0
                    ? "lg:[mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_100%)]"
                    : "lg:[mask-image:linear-gradient(to_right,black_0%,black_86%,transparent_100%)]"
                }`}
            >
              {/* Sliding Track */}
              <div
                className="flex items-center gap-3 sm:gap-4 lg:gap-5 transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(calc(-${activeIndex} * (145px + 0.75rem)))`,
                }}
              >
                {featuredMovies.map((movie, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={movie.id}
                      onClick={() => setActiveIndex(index)}
                      className={`relative w-[145px] sm:w-[185px] lg:w-[208px] aspect-[2/3] rounded-2xl overflow-hidden shrink-0 cursor-pointer transition-all duration-500 select-none ${isActive
                          ? "border-2 border-emerald-400 scale-100 z-20 brightness-100"
                          : "border border-white/10 opacity-50 hover:opacity-85 scale-95 z-10 brightness-75 hover:scale-100"
                        }`}
                    >
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 145px, (max-width: 1024px) 185px, 208px"
                        priority={index === 0}
                      />
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/40 hover:bg-black/10 transition-colors" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Left Edge Dark Shadow Overlay (Chỉ hiện trên Desktop lg+ để không che card trên Mobile/Tablet) */}
              {activeIndex > 0 && (
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-25 pointer-events-none" />
              )}

              {/* Right Edge Dark Shadow Overlay (Chỉ hiện trên Desktop lg+) */}
              {activeIndex < featuredMovies.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/85 via-black/40 to-transparent z-25 pointer-events-none" />
              )}

              {/* Previous Slide Button */}
              {activeIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
                  aria-label="Previous featured movie"
                >
                  <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}

              {/* Next Slide Button */}
              {activeIndex < featuredMovies.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#1c202a]/95 hover:bg-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
                  aria-label="Next featured movie"
                >
                  <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
