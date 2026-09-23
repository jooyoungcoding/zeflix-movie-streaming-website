import { NextRequest, NextResponse } from "next/server";
import { loginController } from "@/features/auth/controller/auth.controller";
import { LoginRequest } from "@/features/auth/auth.type";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    const result = await loginController(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("[POST /api/auth/login] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

    // Handle email not confirmed explicitly
    if (errorMessage.toLowerCase().includes("email not confirmed")) {
      return NextResponse.json(
        { error: "Email is not verified. Please check your email inbox to verify your account before logging in." },
        { status: 403 }
      );
    }

    // Handle authentication / credentials errors
    if (
      errorMessage.includes("Invalid login credentials") ||
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
