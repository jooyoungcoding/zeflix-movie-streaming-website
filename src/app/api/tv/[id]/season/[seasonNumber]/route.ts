import { NextRequest, NextResponse } from "next/server";
import { getTVSeasonEpisodesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; seasonNumber: string }> }
) {
  try {
    const { id, seasonNumber } = await context.params;
    if (!id || !seasonNumber) {
      return NextResponse.json(
        { error: "TV ID and Season Number are required" },
        { status: 400 }
      );
    }

    const result = await getTVSeasonEpisodesController(id, seasonNumber);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(
      "[GET /api/tv/[id]/season/[seasonNumber]] Internal Server Error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch season episodes" },
      { status: 500 }
    );
  }
}
