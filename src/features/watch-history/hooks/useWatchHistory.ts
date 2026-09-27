import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  requestGetWatchHistory,
  requestDeleteWatchHistory,
  requestClearAllWatchHistory,
} from "../api/watch-history.api";
import { WatchHistoryItemDto } from "../watch-history.type";
import {
  clearSavedProgress,
  clearAllSavedProgress,
} from "@/features/playback/service/watch-history.service";

export function useWatchHistory() {
  const [items, setItems] = useState<WatchHistoryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await requestGetWatchHistory();
      if (response.success && Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load watch history";
      // Don't expose technical errors to users
      if (msg === "Unauthorized") {
        setError("Please log in to view your watch history.");
      } else {
        setError("We couldn't load your watch history right now. Please try again later.");
      }
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItemById = useCallback(
    async (
      historyId: string,
      type?: "movie" | "tv",
      tmdbId?: number,
      title?: string
    ) => {
      void title;
      // Optimistic update
      setItems((prev) => prev.filter((i) => i.history_id !== historyId));

      // Clear local storage progress cache
      if (type && tmdbId) {
        clearSavedProgress(type, String(tmdbId));
      }

      try {
        await requestDeleteWatchHistory(historyId, type, tmdbId);
      } catch (err) {
        console.error("Failed to delete watch history item:", err);
        const msg = err instanceof Error ? err.message : "Failed to remove item";
        toast.error(msg);
        // Rollback on failure
        fetchHistory();
      }
    },
    [fetchHistory]
  );

  const clearAll = useCallback(async () => {
    // Optimistic clear
    setItems([]);
    clearAllSavedProgress();

    try {
      await requestClearAllWatchHistory();
    } catch (err: unknown) {
      console.error("Failed to clear watch history:", err);
      const msg = err instanceof Error ? err.message : "Failed to clear watch history";
      toast.error(msg);
      // Rollback on failure
      fetchHistory();
    }
  }, [fetchHistory]);

  return {
    items,
    isLoading,
    error,
    fetchHistory,
    removeItemById,
    clearAll,
  };
}

