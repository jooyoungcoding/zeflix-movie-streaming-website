import { NextResponse } from "next/server";
import {
  getUserWatchlistController,
  toggleWatchlistController,
  deleteWatchlistByIdController,
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
  } catch (error: any) {
    console.error("[GET /api/watchlist] Error:", error);
    const isUnauthorized = error.message === "Unauthorized";
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch watchlist",
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
  } catch (error: any) {
    console.error("[POST /api/watchlist] Error:", error);
    const isUnauthorized = error.message === "Unauthorized";
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update watchlist",
      },
      { status: isUnauthorized ? 401 : 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const watchlistId = searchParams.get("watchlistId");

    if (!watchlistId) {
      return NextResponse.json(
        { success: false, error: "watchlistId query param is required" },
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
  } catch (error: any) {
    console.error("[DELETE /api/watchlist] Error:", error);
    const isUnauthorized = error.message === "Unauthorized";
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete from watchlist",
      },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
