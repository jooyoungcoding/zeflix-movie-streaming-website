import { PlaybackSession, WatchCategory } from "../types/playback.types";

export interface RequestPlaybackParams {
  type: "movie" | "tv";
  tmdbId: string;
  season?: number;
  episode?: number;
  title?: string;
  category?: WatchCategory;
  genres?: string[];
  audio?: "sub" | "dub";
}

/**
 * Native fetch Client API
 * Calls Next.js route handler /api/playback
 * Does NOT query Supabase directly.
 */
export async function requestPlaybackSession(
  params: RequestPlaybackParams
): Promise<PlaybackSession> {
  const query = new URLSearchParams({
    type: params.type,
    tmdbId: params.tmdbId,
  });

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.type === "tv") {
    if (params.season !== undefined) {
      query.set("season", String(params.season));
    }
    if (params.episode !== undefined) {
      query.set("episode", String(params.episode));
    }
  }

  if (params.title) {
    query.set("title", params.title);
  }

  if (params.genres && params.genres.length > 0) {
    query.set("genres", params.genres.join(","));
  }

  if (params.audio) {
    query.set("audio", params.audio);
  }

  const response = await fetch(`/api/playback?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Failed to fetch playback session (${response.status})`
    );
  }

  const json = await response.json();
  return json.data as PlaybackSession;
}
