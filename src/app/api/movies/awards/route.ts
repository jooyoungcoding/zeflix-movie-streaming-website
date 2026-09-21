import { NextResponse } from "next/server";
import { getAwardMoviesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getAwardMoviesController(10);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/movies/awards] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch award movies" },
      { status: 500 }
    );
  }
}
