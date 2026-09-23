"use client";

import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  requestGetWatchlist,
  requestToggleWatchlist,
  requestDeleteWatchlistById,
  requestCheckWatchlistStatus,
} from "../api/watchlist.api";
import { ToggleWatchlistRequest, WatchlistItemDto } from "../watchlist.type";
import { useAuthStore } from "@/store/auth.store";
import { useAuthModalStore } from "@/store/auth-modal.store";

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useAuthStore((state) => state.user_id);

  const fetchWatchlist = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await requestGetWatchlist();
      if (res.success) {
        setItems(res.data);
      }
    } catch (err: unknown) {
      console.error("useWatchlist fetch error:", err);
      const msg = err instanceof Error ? err.message : "Failed to load watchlist";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const toggleItem = useCallback(
    async (
      media: ToggleWatchlistRequest,
      onSuccess?: (isAdded: boolean) => void
    ) => {
      if (!userId) {
        useAuthModalStore.getState().openModal({
          title: "Sign in to add to Watchlist",
          description: `Please sign in or create an account to add "${media.title}" to your personal watchlist.`,
        });
        return false;
      }

      try {
        const res = await requestToggleWatchlist(media);
        if (res.success) {
          const isAdded = res.data.isAdded;
          if (!isAdded) {
            // Also update internal state if we have the list loaded
            setItems((prev) =>
              prev.filter((i) => i.content.tmdb_id !== media.tmdb_id)
            );
          }
          if (onSuccess) {
            onSuccess(isAdded);
          }
          return isAdded;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update watchlist";
        toast.error(msg, {
          id: `wl-err-${media.tmdb_id}`,
        });
        throw err;
      }
    },
    [userId]
  );

  const removeItemById = useCallback(async (watchlistId: string, _title?: string) => {
    // Optimistic removal
    setItems((prev) => prev.filter((item) => item.watchlist_id !== watchlistId));

    try {
      await requestDeleteWatchlistById(watchlistId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove item";
      toast.error(msg);
      // Re-fetch to restore state on failure
      fetchWatchlist();
    }
  }, [fetchWatchlist]);

  return {
    items,
    isLoading,
    error,
    fetchWatchlist,
    toggleItem,
    removeItemById,
  };
}

export function useWatchlistStatus(tmdbId?: number, type: "movie" | "tv" = "movie") {
  const [isWatchlist, setIsWatchlist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!tmdbId) return;
    let isMounted = true;

    async function check() {
      try {
        setIsLoading(true);
        const res = await requestCheckWatchlistStatus(tmdbId!, type);
        if (isMounted) {
          setIsWatchlist(res.isAdded);
        }
      } catch {
        if (isMounted) setIsWatchlist(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    check();

    return () => {
      isMounted = false;
    };
  }, [tmdbId, type]);

  return { isWatchlist, setIsWatchlist, isLoading };
}
