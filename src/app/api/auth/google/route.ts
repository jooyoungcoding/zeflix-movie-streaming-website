import { NextResponse } from "next/server";
import { googleLoginController } from "@/features/auth/controller/auth.controller";

export async function GET() {
  try {
    const url = await googleLoginController();

    return NextResponse.json({
      url,
    });
  } catch (error: any) {
    console.error("[GET /api/auth/google] Error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to initialize Google login",
      },
      {
        status: 500,
      }
    );
  }
}
