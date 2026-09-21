import { NextRequest, NextResponse } from "next/server";
import { getSimilarMoviesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    const result = await getSimilarMoviesController(id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/movies/[id]/similar] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar movies" },
      { status: 500 }
    );
  }
}
