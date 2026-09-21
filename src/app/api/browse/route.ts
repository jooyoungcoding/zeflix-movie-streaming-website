import { NextRequest, NextResponse } from "next/server";
import {
  getBrowseContentController,
  getBrowseGridController,
} from "@/features/movie/controller/movie.controller";
import { BrowseFilterParams } from "@/domain/movie/movie.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get("type");
    const countryParam = searchParams.get("country");
    const genreParam = searchParams.get("genre");
    const sortParam = searchParams.get("sort");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    // If request contains grid parameters (page, sort, genre, limit) or lowercase types
    if (
      pageParam ||
      sortParam ||
      genreParam ||
      limitParam ||
      typeParam === "all" ||
      typeParam === "movies" ||
      typeParam === "tv"
    ) {
      const type: "all" | "movies" | "tv" =
        typeParam === "movies" || typeParam === "Movies"
          ? "movies"
          : typeParam === "tv" || typeParam === "TV Series"
          ? "tv"
          : "all";

      const sort:
        | "all"
        | "popular"
        | "most-rated"
        | "new-releases"
        | "worst-rated"
        | "title-asc"
        | "title-desc" =
        sortParam === "popular" ||
        sortParam === "most-rated" ||
        sortParam === "new-releases" ||
        sortParam === "worst-rated" ||
        sortParam === "title-asc" ||
        sortParam === "title-desc"
          ? sortParam
          : "all";

      const params: BrowseFilterParams = {
        type,
        country: countryParam || "all",
        genre: genreParam || undefined,
        sort,
        page: pageParam ? parseInt(pageParam, 10) || 1 : 1,
        limit: limitParam ? parseInt(limitParam, 10) || 20 : 20,
      };

      const result = await getBrowseGridController(params);
      return NextResponse.json(result, { status: 200 });
    }

    // Legacy fallback for BrowseByCountry
    const result = await getBrowseContentController(typeParam, countryParam);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/browse] Internal Server Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch browse content",
      },
      { status: 500 }
    );
  }
}
