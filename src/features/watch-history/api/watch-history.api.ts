import {
  UpsertWatchProgressRequest,
  UpsertWatchProgressResponse,
  WatchHistoryResponse,
  WatchProgressResponse,
} from "../watch-history.type";

/**
 * Client API: uses native fetch() to call Next.js route handlers.
 * Does NOT query Supabase directly.
 */

export const requestGetWatchHistory = async (): Promise<WatchHistoryResponse> => {
  const response = await fetch("/api/watch-history", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch watch history (${response.status})`);
  }

  return await response.json();
};

export const requestGetProgress = async (
  type: "movie" | "tv",
  tmdbId: number,
  seasonNumber?: number,
  episodeNumber?: number
): Promise<WatchProgressResponse> => {
  const query = new URLSearchParams({
    type,
    tmdbId: String(tmdbId),
  });

  if (type === "tv" && seasonNumber !== undefined) {
    query.set("seasonNumber", String(seasonNumber));
  }
  if (type === "tv" && episodeNumber !== undefined) {
    query.set("episodeNumber", String(episodeNumber));
  }

  const response = await fetch(`/api/watch-history/progress?${query.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return { success: false, data: null };
  }

  return await response.json();
};

export const requestUpsertProgress = async (
  data: UpsertWatchProgressRequest
): Promise<UpsertWatchProgressResponse> => {
  try {
    const response = await fetch("/api/watch-history", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    });

    if (!response.ok) {
      // Don't throw — progress save failures should not crash playback
      return { success: false };
    }

    return await response.json();
  } catch {
    return { success: false };
  }
};

export const requestDeleteWatchHistory = async (
  historyId: string,
  type?: "movie" | "tv",
  tmdbId?: number
): Promise<{ success: boolean }> => {
  const query = new URLSearchParams({ history_id: historyId });
  if (type) query.set("type", type);
  if (tmdbId) query.set("tmdb_id", String(tmdbId));

  const response = await fetch(`/api/watch-history?${query.toString()}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete watch history (${response.status})`);
  }

  return await response.json();
};

export const requestClearAllWatchHistory = async (): Promise<{ success: boolean }> => {
  const response = await fetch("/api/watch-history?all=true", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to clear watch history (${response.status})`);
  }

  return await response.json();
};

