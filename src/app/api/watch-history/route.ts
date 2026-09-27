import { NextResponse } from "next/server";
import {
  getWatchHistoryController,
  upsertProgressController,
  deleteWatchHistoryController,
  clearAllWatchHistoryController,
} from "@/features/watch-history/controller/watch-history.controller";

export const dynamic = "force-dynamic";

/**
 * GET /api/watch-history
 * Get the authenticated user's watch history.
 */
export async function GET() {
  try {
    const history = await getWatchHistoryController();
    return NextResponse.json(
      { success: true, data: history },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/watch-history] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch watch history";
    const isUnauthorized = msg === "Unauthorized";
    return NextResponse.json(
      { success: false, error: msg },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}

/**
 * PUT /api/watch-history
 * Create or update playback progress.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("[PUT /api/watch-history] Saving progress:", {
      type: body.type,
      tmdb_id: body.tmdb_id,
      progress_seconds: body.progress_seconds,
      completed: body.completed,
    });
    const result = await upsertProgressController(body);
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[PUT /api/watch-history] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to save progress";
    const isUnauthorized = msg === "Unauthorized";
    return NextResponse.json(
      { success: false, error: msg },
      { status: isUnauthorized ? 401 : 400 }
    );
  }
}

/**
 * DELETE /api/watch-history
 * Delete an item from watch history or clear all.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    if (all === "true") {
      const success = await clearAllWatchHistoryController();
      return NextResponse.json({ success }, { status: 200 });
    }

    const historyId = searchParams.get("history_id");
    const type = searchParams.get("type") as "movie" | "tv" | null;
    const tmdbIdStr = searchParams.get("tmdb_id");
    const tmdbId = tmdbIdStr ? parseInt(tmdbIdStr, 10) : undefined;

    if (!historyId) {
      return NextResponse.json(
        { success: false, error: "history_id is required" },
        { status: 400 }
      );
    }

    const success = await deleteWatchHistoryController(historyId, {
      type: type || undefined,
      tmdbId,
    });

    return NextResponse.json({ success }, { status: 200 });
  } catch (error: unknown) {
    console.error("[DELETE /api/watch-history] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete watch history";
    const isUnauthorized = msg === "Unauthorized";
    return NextResponse.json(
      { success: false, error: msg },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}

