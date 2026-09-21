import { NextResponse } from "next/server";
import { getFeaturedContentController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getFeaturedContentController();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/featured] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured content" },
      { status: 500 }
    );
  }
}
