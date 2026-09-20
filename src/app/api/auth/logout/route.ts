import { NextResponse } from "next/server";
import { logoutController } from "@/features/auth/controller/auth.controller";

export async function POST() {
  try {
    await logoutController();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("[POST /api/auth/logout] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to logout" },
      { status: 500 }
    );
  }
}
