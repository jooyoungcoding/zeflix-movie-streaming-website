import { NextResponse } from "next/server";
import { getPopularContentController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getPopularContentController();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/popular] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular content" },
      { status: 500 }
    );
  }
}
