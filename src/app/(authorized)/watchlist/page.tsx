"use client";

import React, { useEffect, useState } from "react";
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
    const { items, isLoading, error, fetchWatchlist, removeItemById, removeAll } =
        useWatchlist();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    return (
        <div className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-8">
                    <h1 className="font-custom1 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                        My Watchlist
                    </h1>

                    {!isLoading && !error && items.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            className="font-custom1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-colors active:scale-95 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove All</span>
                        </button>
                    )}
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
                        <p className="text-sm text-zinc-400 mb-6 max-w-xs">
                            Discover movies and TV shows you love.
                        </p>
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

                            const getMediaPosterUrl = (
                                posterPath?: string | null,
                                backdropPath?: string | null
                            ) => {
                                if (posterPath && posterPath.trim()) {
                                    if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
                                        return posterPath;
                                    }
                                    return `https://image.tmdb.org/t/p/w500${posterPath.startsWith("/") ? "" : "/"}${posterPath}`;
                                }
                                if (backdropPath && backdropPath.trim()) {
                                    if (backdropPath.startsWith("http://") || backdropPath.startsWith("https://")) {
                                        return backdropPath;
                                    }
                                    return `https://image.tmdb.org/t/p/w500${backdropPath.startsWith("/") ? "" : "/"}${backdropPath}`;
                                }
                                return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";
                            };

                            const posterUrl = getMediaPosterUrl(
                                content.poster_path,
                                content.backdrop_path
                            );

                            const primaryGenre =
                                content.genres && content.genres.length > 0
                                    ? content.genres[0]
                                    : type === "tv"
                                        ? "Drama"
                                        : "Movie";
                            const remainingGenres =
                                content.genres && content.genres.length > 1
                                    ? content.genres.length - 1
                                    : 0;

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
                                                    : "0.0"}
                                            </span>
                                            <span className="text-zinc-500">•</span>
                                            <span className="truncate max-w-[85px]">
                                                {primaryGenre}
                                                {remainingGenres > 0 && ` +${remainingGenres}`}
                                            </span>
                                            <span className="text-zinc-500">•</span>
                                            <span className="truncate">
                                                {type === "tv"
                                                    ? (content.season ? (content.season.endsWith("S") ? content.season : `${content.season}S`) : "Series")
                                                    : "Movie"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remove button — top right, always visible on mobile, visible on hover for desktop */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeItemById(watchlist_id, content.title);
                                        }}
                                        title="Remove from Watchlist"
                                        className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-400 hover:bg-black/80 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Confirmation Popup Modal */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowConfirmModal(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800/90 p-5 shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-custom1 text-base font-bold text-white">
                                    Clear Watchlist?
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    Remove all movies and series
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Are you sure you want to remove all titles from your watchlist? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="font-custom1 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    removeAll();
                                }}
                                className="font-custom1 px-3.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium transition-colors cursor-pointer"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}