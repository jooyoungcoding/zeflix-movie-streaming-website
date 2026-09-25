import { NextRequest, NextResponse } from "next/server";
import { getPlaybackSessionController } from "@/features/playback/controller/playback.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const tmdbId = searchParams.get("tmdbId");
    const category = (searchParams.get("category") as "anime" | "sentai" | "normal") || undefined;
    const season = searchParams.get("season") || undefined;
    const episode = searchParams.get("episode") || undefined;
    const title = searchParams.get("title") || undefined;
    const genres = searchParams.get("genres")
      ? searchParams
          .get("genres")!
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    const audio = (searchParams.get("audio") as "sub" | "dub") || undefined;
    const originCountry = searchParams.get("originCountry")
      ? searchParams
          .get("originCountry")!
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    const originalLanguage = searchParams.get("originalLanguage") || undefined;

    if (!type || (type !== "movie" && type !== "tv")) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'type' must be 'movie' or 'tv'" },
        { status: 400 }
      );
    }

    if (!tmdbId) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'tmdbId' is required" },
        { status: 400 }
      );
    }

    const session = await getPlaybackSessionController({
      type,
      tmdbId,
      category,
      season,
      episode,
      title,
      genres,
      audio,
      originCountry,
      originalLanguage,
    });

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: unknown) {
    console.error("[GET /api/playback] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to resolve playback session";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
