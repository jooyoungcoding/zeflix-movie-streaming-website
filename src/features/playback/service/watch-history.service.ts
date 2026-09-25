/**
 * Watch History Manager for Zeflix Playback Architecture
 *
 * Requirements:
 * - Provider-independent: Progress is preserved across provider fallback
 *   (e.g., VidLink -> SuperEmbed or SuperSentaiProvider -> VidLink -> SuperEmbed).
 * - Stores progress_seconds, duration_seconds, completed, last_watched_at.
 * - Does NOT store temporary provider URLs.
 * - Uses existing schema concepts for movies, TV, and Super Sentai.
 */

export interface WatchProgressData {
  mediaKey: string;
  tmdbId: string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
  last_watched_at: string;
}

const STORAGE_PREFIX = "zeflix:watch_progress:";

export function generateMediaProgressKey(
  type: "movie" | "tv",
  tmdbId: string,
  season?: number,
  episode?: number
): string {
  if (type === "tv") {
    return `${STORAGE_PREFIX}tv_${tmdbId}_s${season || 1}_e${episode || 1}`;
  }
  return `${STORAGE_PREFIX}movie_${tmdbId}`;
}

/**
 * Load saved playback progress in seconds for given media
 */
export function getSavedProgress(
  type: "movie" | "tv",
  tmdbId: string,
  season?: number,
  episode?: number
): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = generateMediaProgressKey(type, tmdbId, season, episode);
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const data = JSON.parse(raw) as WatchProgressData;
    // If completed or progress is within the last 10 seconds of duration, start over
    if (data.completed || (data.duration_seconds > 0 && data.duration_seconds - data.progress_seconds < 15)) {
      return 0;
    }
    return Math.max(0, data.progress_seconds || 0);
  } catch {
    return 0;
  }
}

/**
 * Persist current playback progress in seconds
 */
export function savePlaybackProgress(
  type: "movie" | "tv",
  tmdbId: string,
  progressSeconds: number,
  durationSeconds: number,
  season?: number,
  episode?: number
): void {
  if (typeof window === "undefined" || !tmdbId) return;
  try {
    const key = generateMediaProgressKey(type, tmdbId, season, episode);
    const isCompleted = durationSeconds > 0 && progressSeconds >= durationSeconds * 0.92;

    const data: WatchProgressData = {
      mediaKey: key,
      tmdbId,
      type,
      season,
      episode,
      progress_seconds: Math.floor(progressSeconds),
      duration_seconds: Math.floor(durationSeconds),
      completed: isCompleted,
      last_watched_at: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage quota or parsing error ignored gracefully
  }
}
