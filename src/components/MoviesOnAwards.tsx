"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Bookmark, Star, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export interface AwardMovie {
  id: string;
  tag: string;
  title: string;
  rating: string;
  duration: string;
  year: string;
  genres: string[];
  certificate: string;
  description: string;
  backdrop: string;
  href?: string;
}

export const awardMoviesList: AwardMovie[] = [
  {
    id: "mov-aw-1",
    tag: "Best Pictures",
    title: "Gundala",
    rating: "4.6",
    duration: "2h40m",
    year: "2022",
    genres: ["Superhero", "Action"],
    certificate: "PG-13",
    description:
      "When international arms dealer and criminal mastermind Elena Federova orchestrates seven simultaneous New York City bank heists, principled and relentless agent Val Turner vows to take her down. An outcast in the bureau, Val soon learns that she'll have to...",
    backdrop: "https://image.tmdb.org/t/p/original/2vFuG6bWGyQUzYS9d69E5l85nIz.jpg",
    href: "/watch/gundala",
  },
  {
    id: "mov-aw-2",
    tag: "7 Oscar Winner",
    title: "Oppenheimer",
    rating: "4.9",
    duration: "3h00m",
    year: "2023",
    genres: ["Biography", "Drama"],
    certificate: "R",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral complexities and global aftermath of the Manhattan Project.",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    href: "/watch/oppenheimer",
  },
  {
    id: "mov-aw-3",
    tag: "Best Picture 2023",
    title: "Everything Everywhere All at Once",
    rating: "4.8",
    duration: "2h19m",
    year: "2022",
    genres: ["Sci-Fi", "Comedy"],
    certificate: "R",
    description:
      "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    backdrop: "https://image.tmdb.org/t/p/original/m8JTwjd0NM2PAYYKDvCuWmuQIP5.jpg",
    href: "/watch/eeaao",
  },
  {
    id: "mov-aw-4",
    tag: "Visual Masterpiece",
    title: "Dune: Part Two",
    rating: "4.9",
    duration: "2h46m",
    year: "2024",
    genres: ["Sci-Fi", "Adventure"],
    certificate: "PG-13",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520bne.jpg",
    href: "/watch/dune-2",
  },
];

export default function MoviesOnAwards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const currentItem = awardMoviesList[currentIndex];

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % awardMoviesList.length);
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex(
      (prev) => (prev - 1 + awardMoviesList.length) % awardMoviesList.length
    );
  };

  const toggleFavorite = (item: AwardMovie) => {
    const isAdded = !!favorites[item.id];
    setFavorites((prev) => ({
      ...prev,
      [item.id]: !isAdded,
    }));

    if (!isAdded) {
      toast.success(`Added "${item.title}" to Watchlist!`, {
        id: `watchlist-${item.id}`,
        icon: "🔖",
        duration: 2500,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    } else {
      toast(`Removed "${item.title}" from Watchlist`, {
        id: `watchlist-${item.id}`,
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
    <div className="flex flex-col h-full justify-between overflow-hidden">
      {/* Header with Title & Navigation Arrows */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide font-custom2">
          Movies on Awards
        </h2>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1c202a] hover:bg-[#2a303d] text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 active:scale-95 cursor-pointer"
            aria-label="Previous movie on awards"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1c202a] hover:bg-[#2a303d] text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 active:scale-95 cursor-pointer"
            aria-label="Next movie on awards"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Award Content with Slide Animation */}
      <div
        key={`${currentItem.id}-${direction}`}
        className={`flex flex-col flex-1 space-y-3.5 sm:space-y-4 ${
          direction === "right" ? "animate-slide-right" : "animate-slide-left"
        }`}
      >
        {/* Landscape Image Banner */}
        <div className="relative w-full aspect-[16/9.5] rounded-xl sm:rounded-2xl overflow-hidden bg-[#12151c] shadow-lg">
          <Image
            key={currentItem.id}
            src={currentItem.backdrop}
            alt={currentItem.title}
            fill
            priority
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Tag Badge */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#1f2430] text-zinc-300 text-xs font-semibold tracking-wide border border-white/10">
            {currentItem.tag}
          </span>
        </div>

        {/* Title */}
        <h3
          key={`title-${currentItem.id}`}
          className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight line-clamp-1"
        >
          {currentItem.title}
        </h3>

        {/* Metadata Details Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-zinc-300">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{currentItem.rating}</span>
          </div>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-medium">{currentItem.duration}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-medium">{currentItem.year}</span>
          {currentItem.genres.map((genre) => (
            <React.Fragment key={genre}>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">{genre}</span>
            </React.Fragment>
          ))}
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-medium">{currentItem.certificate}</span>
        </div>

        {/* Description Paragraph */}
        <p
          key={`desc-${currentItem.id}`}
          className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-3"
        >
          {currentItem.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Watch Now Button */}
          <button
            type="button"
            className="font-custom1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-[#2ca566] hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-white text-white" />
            <span>Watch Now</span>
          </button>

          {/* Add Watchlist Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(currentItem)}
            className="font-custom1 inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-white text-xs sm:text-sm font-semibold tracking-wide border border-white/10 transition-all duration-200 cursor-pointer group/fav"
          >
            {favorites[currentItem.id] ? (
              <>
                <Bookmark className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-400 fill-yellow-400 stroke-yellow-400 transition-transform duration-300 scale-110 shrink-0" />
                <span>Added to Watchlist</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.2] text-white transition-all duration-200 group-hover/fav:text-yellow-400 group-hover/fav:scale-110 shrink-0" />
                <span>Add Watchlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
