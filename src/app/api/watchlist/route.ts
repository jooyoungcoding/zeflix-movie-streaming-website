import { NextResponse } from "next/server";
import {
  getUserWatchlistController,
  toggleWatchlistController,
  deleteWatchlistByIdController,
  clearUserWatchlistController,
} from "@/features/watchlist/controller/watchlist.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getUserWatchlistController();
    return NextResponse.json(
      {
        success: true,
        data: list,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/watchlist] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch watchlist";
    const isUnauthorized = msg === "Unauthorized";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await toggleWatchlistController(body);
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/watchlist] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update watchlist";
    const isUnauthorized = msg === "Unauthorized";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: isUnauthorized ? 401 : 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";
    const watchlistId = searchParams.get("watchlistId");

    if (clearAll) {
      const result = await clearUserWatchlistController();
      return NextResponse.json(
        {
          success: true,
          data: result,
        },
        { status: 200 }
      );
    }

    if (!watchlistId) {
      return NextResponse.json(
        { success: false, error: "watchlistId or all=true query param is required" },
        { status: 400 }
      );
    }

    const result = await deleteWatchlistByIdController(watchlistId);
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[DELETE /api/watchlist] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete from watchlist";
    const isUnauthorized = msg === "Unauthorized";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
