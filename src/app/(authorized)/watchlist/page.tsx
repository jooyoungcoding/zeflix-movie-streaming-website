"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Star,
    Trash2,
    Clapperboard,
} from "lucide-react";
import { useWatchlist } from "@/features/watchlist/hooks/useWatchlist";
import { WatchlistItemDto } from "@/features/watchlist/watchlist.type";

export default function WatchlistPage() {
    const { items, isLoading, error, fetchWatchlist, removeItemById } =
        useWatchlist();

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const getYear = (dateStr?: string | null) => {
        if (!dateStr) return "";
        return dateStr.split("-")[0] || "";
    };

    return (
        <div className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="pb-6 border-b border-zinc-800/80 mb-8">
                    <h1 className="font-custom1 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                        My Watchlist
                    </h1>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 animate-pulse">
                        {Array.from({ length: 10 }).map((_, i) => (
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
                ) : error ? (
                    <div className="p-8 text-center bg-zinc-900/50 border border-red-500/20 rounded-2xl my-12">
                        <p className="text-red-400 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => fetchWatchlist()}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-xl transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 my-8">
                        <div className="w-20 h-20 rounded-full bg-zinc-800/80  flex items-center justify-center mb-5 shadow-inner">
                            <Clapperboard className="w-10 h-10 text-zinc-500" />
                        </div>
                        <h3 className="font-custom1 text-xl font-bold text-white">
                            Your Watchlist is empty
                        </h3>
                    </div>
                ) : (
                    /* Search-style card grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                        {items.map((item: WatchlistItemDto) => {
                            const { content, type, watchlist_id } = item;
                            const detailHref =
                                type === "movie"
                                    ? `/movie/${content.tmdb_id}`
                                    : `/tv/${content.tmdb_id}`;

                            const posterUrl = content.poster_path
                                ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
                                : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";

                            const primaryType = type === "movie" ? "Movie" : "Series";

                            return (
                                <Link
                                    key={watchlist_id}
                                    href={detailHref}
                                    className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151d] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/80 select-none block"
                                >
                                    {/* Poster */}
                                    <Image
                                        src={posterUrl}
                                        alt={content.title || "Media Poster"}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* TV Season Badge */}
                                    {type === "tv" && (
                                        <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-zinc-300 shadow-md">
                                            S1
                                        </div>
                                    )}

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                                    {/* Bottom metadata */}
                                    <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-10 space-y-1">
                                        <h3 className="font-bold text-white text-xs sm:text-sm truncate drop-shadow">
                                            {content.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 drop-shadow">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                                            <span className="font-semibold text-white">
                                                {content.vote_average > 0
                                                    ? content.vote_average.toFixed(1)
                                                    : "—"}
                                            </span>
                                            <span className="text-zinc-500">•</span>
                                            <span className="truncate max-w-[60px]">
                                                {getYear(content.release_date) || "—"}
                                            </span>
                                            <span className="text-zinc-500">•</span>
                                            <span className="truncate">{primaryType}</span>
                                        </div>
                                    </div>

                                    {/* Remove button — top right, visible on hover */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeItemById(watchlist_id, content.title);
                                        }}
                                        title="Remove from Watchlist"
                                        className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}