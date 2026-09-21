import { NextResponse } from "next/server";
import { getBestMoviesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getBestMoviesController();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/movies/best] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch best movies" },
      { status: 500 }
    );
  }
}
