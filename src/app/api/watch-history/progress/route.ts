import { NextRequest, NextResponse } from "next/server";
import { getProgressController } from "@/features/watch-history/controller/watch-history.controller";

export const dynamic = "force-dynamic";

/**
 * GET /api/watch-history/progress?type=movie&tmdbId=123
 * GET /api/watch-history/progress?type=tv&tmdbId=123&seasonNumber=1&episodeNumber=3
 *
 * Get saved progress for a specific movie or episode.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "movie" | "tv" | null;
    const tmdbId = parseInt(
      searchParams.get("tmdbId") || searchParams.get("tmdb_id") || "0",
      10
    );
    const seasonNumber =
      parseInt(searchParams.get("seasonNumber") || searchParams.get("season_number") || "0", 10) ||
      undefined;
    const episodeNumber =
      parseInt(searchParams.get("episodeNumber") || searchParams.get("episode_number") || "0", 10) ||
      undefined;

    if (!type || !tmdbId) {
      return NextResponse.json(
        { success: false, error: "type and tmdbId are required" },
        { status: 400 }
      );
    }

    const progress = await getProgressController({
      type,
      tmdb_id: tmdbId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
    });

    return NextResponse.json(
      { success: true, data: progress },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/watch-history/progress] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to get progress";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 400 }
    );
  }
}
