import { NextResponse } from "next/server";
import { logoutController } from "@/features/auth/controller/auth.controller";

export async function POST() {
  try {
    await logoutController();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    console.error("[POST /api/auth/logout] Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to logout";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
