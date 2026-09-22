import { NextResponse } from "next/server";
import { getCurrentUserController } from "@/features/auth/controller/auth.controller";

export async function GET() {
  try {
    const data = await getCurrentUserController();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("[GET /api/auth/me] Error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
