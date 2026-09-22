import { NextResponse } from "next/server";
import { checkWatchlistStatusController } from "@/features/watchlist/controller/watchlist.controller";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdbIdStr = searchParams.get("tmdbId");
    const type = searchParams.get("type") as "movie" | "tv" | null;

    if (!tmdbIdStr || !type) {
      return NextResponse.json(
        { success: false, error: "tmdbId and type are required" },
        { status: 400 }
      );
    }

    const tmdbId = parseInt(tmdbIdStr, 10);
    const result = await checkWatchlistStatusController(tmdbId, type);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/watchlist/check] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to check watchlist status";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
