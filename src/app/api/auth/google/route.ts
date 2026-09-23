import { NextResponse } from "next/server";
import { googleLoginController } from "@/features/auth/controller/auth.controller";

export async function GET() {
  try {
    const url = await googleLoginController();

    return NextResponse.json({
      url,
    });
  } catch (error: unknown) {
    console.error("[GET /api/auth/google] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to initialize Google login";
    return NextResponse.json(
      {
        error: msg,
      },
      {
        status: 500,
      }
    );
  }
}
