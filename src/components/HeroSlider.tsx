"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Film,
  Bookmark,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export interface MovieSlide {
  id: string;
  tag: string;
  title: string;
  year: string;
  genres: string[];
  description: string;
  backdrop: string;
  trailerId: string; // YouTube Video ID
}

export const heroMovies: MovieSlide[] = [
  {
    id: "1",
    tag: "Coming next week",
    title: "Star Wars: The force Awaken",
    year: "2022",
    genres: ["Fantasy", "Actions"],
    description:
      "The third season of the American television series The Mandalorian stars Pedro Pascal as the title character, a bounty hunter traveling to Mandalore to redeem his past transgressions with his adopted son Grogu and being aided on their journey by fellow Mandalorian Bo-Katan Kryze.",
    backdrop: "https://image.tmdb.org/t/p/original/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
    trailerId: "sGbxmsDFVnE",
  },
  {
    id: "2",
    tag: "Trending #1",
    title: "Dune: Part Two",
    year: "2024",
    genres: ["Sci-Fi", "Adventure"],
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520bne.jpg",
    trailerId: "Way9Dexny3w",
  },
  {
    id: "3",
    tag: "Oscar Winner",
    title: "Oppenheimer",
    year: "2023",
    genres: ["Biography", "Drama"],
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral complexities and global aftermath of the Manhattan Project.",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    trailerId: "uYPbbksJxIg",
  },
  {
    id: "4",
    tag: "Fan Favorite",
    title: "Spider-Man: Across the Spider-Verse",
    year: "2023",
    genres: ["Animation", "Action"],
    description:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
    backdrop: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    trailerId: "cqGjhVJWtEg",
  },
  {
    id: "5",
    tag: "Sci-Fi Classic",
    title: "Interstellar",
    year: "2014",
    genres: ["Sci-Fi", "Drama"],
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humanity's survival across the distant galaxy.",
    backdrop: "https://image.tmdb.org/t/p/original/rAiYTsqJJR9as0HN5q9m8BH9bQI.jpg",
    trailerId: "zSWdZVtXT7E",
  },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTrailerId, setActiveTrailerId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMovie = heroMovies[currentIndex];

  // Auto-play slide timer
  useEffect(() => {
    if (isPaused || activeTrailerId !== null) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, activeTrailerId]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  const toggleWatchlist = (movie: MovieSlide) => {
    const isCurrentlyAdded = !!watchlist[movie.id];
    const willBeAdded = !isCurrentlyAdded;

    setWatchlist((prev) => ({ ...prev, [movie.id]: willBeAdded }));

    if (willBeAdded) {
      toast.success(`Added "${movie.title}" to Watchlist!`, {
        id: `watchlist-${movie.id}`,
        icon: "🔖",
        style: {
          borderRadius: "12px",
          background: "#161922",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
        },
      });
    } else {
      toast(`Removed "${movie.title}" from Watchlist`, {
        id: `watchlist-${movie.id}`,
        icon: "🗑️",
        style: {
          borderRadius: "12px",
          background: "#161922",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
        },
      });
    }
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);

    toast(nextState ? "Audio Muted" : "Audio Unmuted", {
      id: "audio-toggle",
      icon: nextState ? "🔇" : "🔊",
      style: {
        borderRadius: "12px",
        background: "#161922",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
      },
    });
  };

  return (
    <div
      className="relative w-full h-[92vh] min-h-[620px] max-h-[960px] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides with Crossfade Animation */}
      {heroMovies.map((movie, index) => {
        const isActive = index === currentIndex;

        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            {/* High-res Movie Backdrop Image with Cinematic Ken Burns Zoom */}
            <div className="relative w-full h-full">
              <Image
                src={movie.backdrop}
                alt={movie.title}
                fill
                priority={index === 0}
                className={`object-cover object-center transition-transform duration-[4000ms] ease-out ${isActive ? "scale-108" : "scale-100"
                  }`}
                sizes="100vw"
              />

              {/* Cinematic Vignette & Gradients Overlay matching screenshot */}
              {/* Left text-protection gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-10" />
              {/* Bottom fade gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              {/* Top header fade */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-transparent z-10" />
            </div>
          </div>
        );
      })}

      {/* Main Content Info (Overlaid with Staggered Entrance Animation) */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-12 lg:pb-16 pt-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 sm:gap-6">
          {/* Left Column: Movie Info & Buttons */}
          <div
            key={currentMovie.id}
            className="max-w-2xl lg:max-w-3xl space-y-3.5 sm:space-y-4 lg:space-y-5"
          >
            {/* Tag Badge */}
            <div className="animate-hero-tag">
              <span className="inline-flex font-logo items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs sm:text-[13px] font-medium text-zinc-200 tracking-wide shadow-sm">
                {currentMovie.tag}
              </span>
            </div>

            {/* Movie Title */}
            <h1 className="animate-hero-title text-2xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {currentMovie.title}
            </h1>

            {/* Metadata Details Row */}
            <div className="animate-hero-meta flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-zinc-300 font-medium">
              <span>{currentMovie.year}</span>
              <span className="text-zinc-500">•</span>
              <span>{currentMovie.genres.join(" • ")}</span>
            </div>

            {/* Description Paragraph */}
            <p className="animate-hero-desc text-zinc-300/90 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3 max-w-2xl font-normal drop-shadow-md">
              {currentMovie.description}
            </p>

            {/* Action Buttons */}
            <div className="animate-hero-buttons flex flex-wrap items-center gap-3 sm:gap-3.5 pt-1 sm:pt-2 font-custom1">
              {/* Watch Trailer Button (Green) */}
              <button
                onClick={() => setActiveTrailerId(currentMovie.trailerId)}
                className="font-custom1 inline-flex items-center gap-2 px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-xl bg-[#489d6e] hover:bg-[#3b875d] text-white font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <Film className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
                <span>Watch Trailer</span>
              </button>

              {/* Add Watchlist Button (Dark Glass with Bookmark icon) */}
              <button
                onClick={() => toggleWatchlist(currentMovie)}
                className="font-custom1 inline-flex items-center gap-2 px-4.5 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-xl bg-[#1c202a]/80 hover:bg-[#282e3c] text-white font-medium text-xs sm:text-sm lg:text-base backdrop-blur-md border border-white/15 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer group/fav"
              >
                {watchlist[currentMovie.id] ? (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400 stroke-yellow-400 transition-transform duration-300 scale-110" />
                    <span>Added to Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2] text-white transition-all duration-200 group-hover/fav:text-yellow-400 group-hover/fav:scale-110" />
                    <span>Add Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right/Bottom Controls (5 Pagination Dots + Audio Toggle) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-start lg:self-end pt-2 lg:pt-0 z-30">
            {/* 5 Pagination Dots */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-full border border-white/10 shadow-lg">
              {heroMovies.map((_, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all duration-500 rounded-full cursor-pointer relative overflow-hidden ${
                      isActive
                        ? "w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                        : "w-2 h-2 bg-white/35 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>

            {/* Audio Mute / Unmute Button */}
            <button
              onClick={toggleMute}
              className="w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-[#1c202a]/80 hover:bg-[#282e3c] backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Toggle Audio"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-zinc-300" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Prev / Next Slide Arrows on Hover */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* YouTube Trailer Modal */}
      {activeTrailerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setActiveTrailerId(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer border border-white/20"
              aria-label="Close Trailer"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeTrailerId}?autoplay=1&rel=0`}
              title="Movie Trailer"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
