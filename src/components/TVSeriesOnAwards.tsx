"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export interface AwardTVSeries {
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

export const awardSeriesList: AwardTVSeries[] = [
  {
    id: "ser-aw-1",
    tag: "Emmy Winner",
    title: "The Bear",
    rating: "4.9",
    duration: "35m",
    year: "2023",
    genres: ["Drama", "Comedy"],
    certificate: "TV-MA",
    description:
      "A young fine-dining chef comes home to Chicago to run his family Italian beef sandwich shop after a heartbreaking death in his family. A world away from what he's used to, Carmy must balance soul-crushing realities of small business ownership.",
    backdrop: "https://image.tmdb.org/t/p/original/bKxiLRP0Qm2JwLs09vSbg094Xzc.jpg",
    href: "/watch/the-bear",
  },
  {
    id: "ser-aw-2",
    tag: "Outstanding Drama",
    title: "Succession",
    rating: "4.9",
    duration: "1h00m",
    year: "2023",
    genres: ["Drama", "Business"],
    certificate: "TV-MA",
    description:
      "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their aging father steps down from the company, sparking intense corporate and familial betrayals.",
    backdrop: "https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqHrcdidd.jpg",
    href: "/watch/succession",
  },
  {
    id: "ser-aw-3",
    tag: "8 Emmy Awards",
    title: "Beef Series",
    rating: "4.8",
    duration: "40m",
    year: "2023",
    genres: ["Comedy", "Drama"],
    certificate: "TV-MA",
    description:
      "Two strangers get into a road rage incident that brings out their darkest impulses and upends their lives as their feud slowly turns into an all-consuming obsession with revenge.",
    backdrop: "https://image.tmdb.org/t/p/original/bKxiLRP0Qm2JwLs09vSbg094Xzc.jpg",
    href: "/watch/beef",
  },
  {
    id: "ser-aw-4",
    tag: "Critically Acclaimed",
    title: "The Last of Us",
    rating: "4.8",
    duration: "1h00m",
    year: "2023",
    genres: ["Horror", "Drama"],
    certificate: "TV-MA",
    description:
      "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone across a dangerous post-apocalyptic United States.",
    backdrop: "https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    href: "/watch/the-last-of-us",
  },
];

export default function TVSeriesOnAwards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const currentItem = awardSeriesList[currentIndex];

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % awardSeriesList.length);
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex(
      (prev) => (prev - 1 + awardSeriesList.length) % awardSeriesList.length
    );
  };

  const toggleFavorite = (item: AwardTVSeries) => {
    const isAdded = !!favorites[item.id];
    setFavorites((prev) => ({
      ...prev,
      [item.id]: !isAdded,
    }));

    if (!isAdded) {
      toast.success(`Added "${item.title}" to Favorites!`, {
        id: `fav-${item.id}`,
        icon: "❤️",
        duration: 2500,
        style: {
          background: "#12151c",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
    } else {
      toast(`Removed "${item.title}" from Favorites`, {
        id: `fav-${item.id}`,
        icon: "💔",
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
          TV Series on Awards
        </h2>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1c202a] hover:bg-[#2a303d] text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 active:scale-95 cursor-pointer"
            aria-label="Previous series on awards"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1c202a] hover:bg-[#2a303d] text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10 active:scale-95 cursor-pointer"
            aria-label="Next series on awards"
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

          {/* Add Favorites Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(currentItem)}
            className="font-custom1 inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#1c202a] hover:bg-[#282e3c] active:scale-95 text-white text-xs sm:text-sm font-semibold tracking-wide border border-white/10 transition-all duration-200 cursor-pointer group/fav"
          >
            {favorites[currentItem.id] ? (
              <>
                <Heart className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-500 fill-red-500 stroke-red-500 transition-transform duration-300 scale-110 shrink-0" />
                <span>Added to Favorites</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.2] text-white transition-all duration-200 group-hover/fav:text-red-400 group-hover/fav:scale-110 shrink-0" />
                <span>Add Favorites</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
