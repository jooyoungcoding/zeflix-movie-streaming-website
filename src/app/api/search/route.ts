import { NextRequest, NextResponse } from "next/server";
import { searchContentController } from "@/features/movie/controller/movie.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;
    const limit = limitParam ? parseInt(limitParam, 10) || 20 : 20;

    const result = await searchContentController({
      query,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/search] Internal Server Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to search movies and TV series",
      },
      { status: 500 }
    );
  }
}
