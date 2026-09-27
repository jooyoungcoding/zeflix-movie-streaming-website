"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, Clapperboard, Play, Trash2 } from "lucide-react";
import { useWatchHistory } from "@/features/watch-history/hooks/useWatchHistory";
import {
    WatchHistoryItemDto,
    WatchHistoryMovieDto,
    WatchHistoryTVDto,
} from "@/features/watch-history/watch-history.type";

// ─── Helpers ───

function getYear(dateStr?: string | null): string {
    if (!dateStr) return "";
    return dateStr.split("-")[0] || "";
}

function formatWatchedTime(seconds: number): string {
    if (!seconds || seconds <= 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcPercentage(
    progress: number,
    duration: number | null,
    completed: boolean
): number | null {
    if (completed) return 100;
    if (!duration || duration <= 0) return null;
    return Math.min(100, Math.max(0, Math.round((progress / duration) * 100)));
}

function calcTopBadgePercentage(item: WatchHistoryItemDto): number | null {
    if (item.type === "tv") {
        const tv = item as WatchHistoryTVDto;
        if (tv.completed) return 100;
        if (tv.total_episodes && tv.total_episodes > 0) {
            const epNum = tv.display_episode_number || tv.episode_number || 1;
            return Math.min(100, Math.max(1, Math.round((epNum / tv.total_episodes) * 100)));
        }
    }
    return calcPercentage(item.progress_seconds, item.duration_seconds, item.completed);
}

function calcBottomProgressPercentage(item: WatchHistoryItemDto): number | null {
    if (item.type === "movie" && item.completed) return 100;
    if (item.type === "tv" && (item as WatchHistoryTVDto).episode_completed) return 100;
    if (!item.duration_seconds || item.duration_seconds <= 0) return null;
    return Math.min(
        100,
        Math.max(0, Math.round((item.progress_seconds / item.duration_seconds) * 100))
    );
}

function getMediaPosterUrl(
    posterPath?: string | null,
    backdropPath?: string | null
): string {
    const resolve = (path: string) => {
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        return `https://image.tmdb.org/t/p/w500${path.startsWith("/") ? "" : "/"}${path}`;
    };
    if (posterPath?.trim()) return resolve(posterPath);
    if (backdropPath?.trim()) return resolve(backdropPath);
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";
}

/**
 * Build watch URL for Continue button.
 * Movie: /watch/movie/normal/{tmdb_id}
 * TV incomplete: /watch/tv/normal/{tmdb_id}/{episode} or /watch/tv/normal/{tmdb_id}/{season}/{episode}
 * TV completed: resolve next episode
 */
function buildContinueUrl(item: WatchHistoryItemDto): string {
    if (item.type === "movie") {
        const start =
            item.progress_seconds > 0 && !item.completed
                ? `?start=${Math.floor(item.progress_seconds)}`
                : "";
        return `/watch/movie/normal/${item.tmdb_id}${start}`;
    }
    // TV
    const tv = item as WatchHistoryTVDto;
    const s = tv.season_number || 1;
    const ep = tv.episode_number || 1;

    // If the episode is completed and there's a next episode, route to the next episode
    if (tv.episode_completed && !tv.completed && tv.next_season_number && tv.next_episode_number) {
        return `/watch/tv/normal/${tv.tv_tmdb_id}/${tv.next_season_number}/${tv.next_episode_number}`;
    }

    // If user completed the whole series
    if (tv.completed) {
        return `/watch/tv/normal/${tv.tv_tmdb_id}/${s}/${ep}`;
    }

    const start =
        !tv.episode_completed && tv.progress_seconds > 0
            ? `?start=${Math.floor(tv.progress_seconds)}`
            : "";

    return `/watch/tv/normal/${tv.tv_tmdb_id}/${s}/${ep}${start}`;
}

// ─── Card Component ───

function HistoryCard({
    item,
    onRemove,
}: {
    item: WatchHistoryItemDto;
    onRemove: (historyId: string, type?: "movie" | "tv", tmdbId?: number, title?: string) => void;
}) {
    const isMovie = item.type === "movie";
    const movie = isMovie ? (item as WatchHistoryMovieDto) : null;
    const tv = !isMovie ? (item as WatchHistoryTVDto) : null;

    const title = isMovie ? movie!.title : tv!.tv_name;
    const year = isMovie
        ? getYear(movie!.release_date)
        : getYear(tv!.tv_first_air_date);
    const posterUrl = isMovie
        ? getMediaPosterUrl(movie!.poster_path)
        : getMediaPosterUrl(tv!.tv_poster_path);

    const badgePercentage = calcTopBadgePercentage(item);
    const progressBarPercentage = calcBottomProgressPercentage(item);

    const watchedTime = formatWatchedTime(item.progress_seconds);
    const continueUrl = buildContinueUrl(item);

    const epNumber = tv?.display_episode_number || tv?.episode_number;
    const seasonEpLabel = tv
        ? `S${tv.season_number} E${epNumber}`
        : null;

    const isFullyCompleted = item.completed || (badgePercentage !== null && badgePercentage >= 100);

    return (
        <Link
            href={continueUrl}
            className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#12151d] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/80 block select-none cursor-pointer"
            aria-label={`Continue watching ${title}`}
        >
            {/* Poster Image */}
            <Image
                src={posterUrl}
                alt={title || "Media Poster"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Remove button — top left, always visible on mobile, visible on hover for desktop */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const tmdbId =
                        item.type === "movie"
                            ? (item as WatchHistoryMovieDto).tmdb_id
                            : (item as WatchHistoryTVDto).tv_tmdb_id;
                    onRemove(item.history_id, item.type, tmdbId, title);
                }}
                title="Remove from Watch History"
                className="absolute top-2.5 left-2.5 z-20 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-400 hover:bg-black/80 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
                aria-label="Remove from Watch History"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Progress percentage — top right */}
            {badgePercentage !== null && (
                <div
                    className={`absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg backdrop-blur-md border text-[11px] font-bold shadow-md ${isFullyCompleted
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : "bg-black/60 border-white/10 text-white"
                        }`}
                >
                    {isFullyCompleted ? "100%" : `${badgePercentage}%`}
                </div>
            )}

            {/* Center Play Button Overlay on Hover */}
            <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
            </div>

            {/* Dark Gradient Overlay at Bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 via-35% to-transparent pointer-events-none" />

            {/* Bottom Content Metadata — Positioned directly ABOVE the progress bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-10 space-y-1 pb-3 sm:pb-3.5">
                {/* Title */}
                <h3 className="font-bold text-white text-xs sm:text-sm truncate drop-shadow group-hover:text-emerald-400 transition-colors">
                    {title}
                </h3>

                {/* Metadata Row: Year • Season/Ep / Watched Time */}
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 drop-shadow truncate">
                    {year && <span>{year}</span>}
                    {year && <span className="text-zinc-500">•</span>}
                    {seasonEpLabel && (
                        <>
                            <span className="text-emerald-400 font-semibold">{seasonEpLabel}</span>
                            <span className="text-zinc-500">•</span>
                        </>
                    )}
                    <span className="font-medium text-zinc-200">{watchedTime}</span>
                </div>
            </div>

            {/* Progress Bar — Located at the very bottom edge of the poster card */}
            {progressBarPercentage !== null && (
                <div className="absolute bottom-0 left-0 right-0 z-20 h-1 sm:h-1.5 bg-white/20">
                    <div
                        className={`h-full transition-all duration-300 ${item.completed ? "bg-emerald-400" : "bg-emerald-500"
                            }`}
                        style={{ width: `${Math.min(100, Math.max(0, progressBarPercentage))}%` }}
                    />
                </div>
            )}
        </Link>
    );
}

// ─── Page Component ───

export default function HistoryPage() {
    const { items, isLoading, error, fetchHistory, removeItemById, clearAll } =
        useWatchHistory();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-8">
                    <h1 className="font-custom1 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                        Watch History
                    </h1>

                    {!isLoading && !error && items.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            className="font-custom1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-colors active:scale-95 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>

                {/* Content States */}
                {isLoading ? (
                    /* Skeleton Loading matching all-in-one card style */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 animate-pulse">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="relative aspect-[2/3] rounded-2xl bg-[#12151d] border border-white/5 overflow-hidden p-3 sm:p-3.5 flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="h-5 w-12 bg-zinc-800 rounded-lg" />
                                    <div className="h-5 w-10 bg-zinc-800 rounded-lg" />
                                </div>
                                <div className="space-y-2 pb-1">
                                    <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                                    <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
                                    <div className="h-3 w-1/3 bg-zinc-800/40 rounded" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/80" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    /* Error State */
                    <div className="p-8 text-center bg-zinc-900/50 border border-red-500/20 rounded-2xl my-12">
                        <p className="text-zinc-300 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => fetchHistory()}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-xl transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 my-8">
                        <div className="w-20 h-20 rounded-full bg-zinc-800/80 flex items-center justify-center mb-5 shadow-inner">
                            <Clapperboard className="w-10 h-10 text-zinc-500" />
                        </div>
                        <h3 className="font-custom1 text-xl font-bold text-white mb-2">
                            No watch history yet
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-xs">
                            Start watching movies and TV shows to see them here.
                        </p>
                    </div>
                ) : (
                    /* History Grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                        {items.map((item) => (
                            <HistoryCard
                                key={item.history_id}
                                item={item}
                                onRemove={removeItemById}
                            />
                        ))}
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
                                    Clear Watch History?
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    Remove all watched items
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Are you sure you want to clear your entire watch history? This action cannot be undone.
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
                                    clearAll();
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
