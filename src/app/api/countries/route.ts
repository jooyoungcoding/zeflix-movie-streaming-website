import { NextResponse } from "next/server";
import { getCountriesController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getCountriesController();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/countries] Internal Server Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
