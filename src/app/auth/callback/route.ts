import { NextResponse } from "next/server";
import { exchangeCodeForSessionController } from "@/features/auth/controller/auth.controller";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin)
    );
  }

  try {
    await exchangeCodeForSessionController(code);

    return NextResponse.redirect(new URL("/", requestUrl.origin));
  } catch (error) {
    console.error("[Auth Callback] Error:", error);

    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin)
    );
  }
}
