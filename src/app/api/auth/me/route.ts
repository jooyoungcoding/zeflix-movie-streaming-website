import { NextResponse } from "next/server";
import { getCurrentUserController } from "@/features/auth/controller/auth.controller";

export async function GET() {
  try {
    const data = await getCurrentUserController();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[GET /api/auth/me] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
