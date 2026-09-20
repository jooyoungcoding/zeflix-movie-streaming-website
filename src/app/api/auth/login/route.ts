import { NextRequest, NextResponse } from "next/server";
import { loginController } from "@/features/auth/controller/auth.controller";
import { LoginRequest } from "@/features/auth/auth.type";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    const result = await loginController(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[POST /api/auth/login] Error:", error);

    const errorMessage = error?.message || "Internal Server Error";

    // Handle authentication / credentials errors
    if (
      errorMessage.includes("Invalid login credentials") ||
      errorMessage.includes("Email not confirmed") ||
      errorMessage.includes("Invalid credentials") ||
      errorMessage.includes("invalid_grant")
    ) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    if (
      errorMessage.includes("required") ||
      errorMessage.includes("valid")
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(
      { error: errorMessage || "Internal Server Error" },
      { status: 500 }
    );
  }
}
