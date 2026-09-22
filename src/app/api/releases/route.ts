import { NextRequest, NextResponse } from "next/server";
import { getReleasesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const regionParam = searchParams.get("region") || undefined;

    const parsedYear = yearParam ? parseInt(yearParam, 10) : undefined;
    const year = parsedYear && !isNaN(parsedYear) ? parsedYear : undefined;

    const result = await getReleasesController({
      year,
      region: regionParam,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/releases] Internal Server Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch releases" },
      { status: 500 }
    );
  }
}
