import { NextResponse } from "next/server";
import { getBestTVSeriesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getBestTVSeriesController();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tv/best] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch best TV series" },
      { status: 500 }
    );
  }
}
