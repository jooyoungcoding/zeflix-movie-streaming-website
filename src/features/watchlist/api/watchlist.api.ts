import {
  CheckWatchlistResponse,
  ToggleWatchlistRequest,
  ToggleWatchlistResponse,
  WatchlistResponse,
} from "../watchlist.type";

export const requestGetWatchlist = async (): Promise<WatchlistResponse> => {
  const response = await fetch("/api/watchlist", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch watchlist (${response.status})`);
  }

  return await response.json();
};

export const requestToggleWatchlist = async (
  data: ToggleWatchlistRequest
): Promise<ToggleWatchlistResponse> => {
  const response = await fetch("/api/watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update watchlist (${response.status})`);
  }

  return await response.json();
};

export const requestDeleteWatchlistById = async (
  watchlistId: string
): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/watchlist?watchlistId=${encodeURIComponent(watchlistId)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete from watchlist (${response.status})`);
  }

  return await response.json();
};

export const requestCheckWatchlistStatus = async (
  tmdbId: number,
  type: "movie" | "tv"
): Promise<CheckWatchlistResponse> => {
  const response = await fetch(
    `/api/watchlist/check?tmdbId=${tmdbId}&type=${type}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return { success: false, isAdded: false };
  }

  return await response.json();
};
