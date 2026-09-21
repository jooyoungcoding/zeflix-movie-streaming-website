import { NextResponse } from "next/server";
import { getJustReleasedMoviesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getJustReleasedMoviesController();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/movies/just-releases] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch just released movies" },
      { status: 500 }
    );
  }
}
