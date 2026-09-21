import { NextResponse } from "next/server";
import { getAwardTVSeriesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getAwardTVSeriesController(10);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tv/awards] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch award TV series" },
      { status: 500 }
    );
  }
}
