import { NextRequest, NextResponse } from "next/server";
import { signUpController } from "@/features/auth/controller/auth.controller";
import { SignUpRequest } from "@/features/auth/auth.type";

export async function POST(request: NextRequest) {
  try {
    const body: SignUpRequest = await request.json();

    const result = await signUpController(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/auth/register] Error:", error);

    const errorMessage = error?.message || "Internal Server Error";

    // Handle known business validation / duplicate errors
    if (
      errorMessage.includes("already taken") ||
      errorMessage.includes("already registered")
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    if (
      errorMessage.includes("required") ||
      errorMessage.includes("must be") ||
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
