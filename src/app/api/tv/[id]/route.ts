import { NextRequest, NextResponse } from "next/server";
import { getTVSeriesDetailController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "TV Series ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");

    const result = await getTVSeriesDetailController(id, season);
    if (!result) {
      return NextResponse.json({ error: "TV Series not found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tv/[id]] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch TV series detail" },
      { status: 500 }
    );
  }
}
