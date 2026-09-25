import { defaultPlaybackService } from "../service/playback.service";
import { PlaybackSession, WatchCategory } from "../types/playback.types";

export interface GetPlaybackParams {
  type: "movie" | "tv";
  tmdbId: string;
  season?: number | string;
  episode?: number | string;
  title?: string;
  category?: WatchCategory;
  genres?: string[];
  originalName?: string;
  originCountry?: string[];
  originalLanguage?: string;
  audio?: "sub" | "dub";
}

/**
 * Playback Controller
 * Validates requests and invokes PlaybackService.
 * Does NOT query Supabase or DB directly.
 */
export async function getPlaybackSessionController(
  params: GetPlaybackParams
): Promise<PlaybackSession> {
  const {
    type,
    tmdbId,
    season,
    episode,
    title,
    category,
    genres,
    originalName,
    originCountry,
    originalLanguage,
    audio,
  } = params;

  if (!tmdbId || typeof tmdbId !== "string" || !tmdbId.trim()) {
    throw new Error("Valid tmdbId parameter is required");
  }

  const cleanTmdbId = tmdbId.trim();
  const metadata = {
    category,
    genres,
    originalName,
    originCountry,
    originalLanguage,
    audio,
  };

  if (type === "movie") {
    return await defaultPlaybackService.getMoviePlayback(
      cleanTmdbId,
      title || "",
      metadata
    );
  }

  if (type === "tv") {
    const s = parseInt(String(season || "1"), 10) || 1;
    const ep = parseInt(String(episode || "1"), 10) || 1;

    return await defaultPlaybackService.getTvPlayback(
      cleanTmdbId,
      s,
      ep,
      title || "",
      metadata
    );
  }

  throw new Error("Invalid playback type: must be 'movie' or 'tv'");
}
