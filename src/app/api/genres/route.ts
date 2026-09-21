import { NextRequest, NextResponse } from "next/server";
import { getGenresController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const result = await getGenresController(type);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/genres] Internal Server Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
