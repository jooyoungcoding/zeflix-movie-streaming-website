import { NextResponse } from "next/server";
import { getUpcomingMoviesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getUpcomingMoviesController();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/movies/upcoming] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming movies" },
      { status: 500 }
    );
  }
}
