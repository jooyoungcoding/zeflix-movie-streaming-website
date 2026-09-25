import { NextRequest, NextResponse } from "next/server";
import { getPersonDetailController } from "@/features/person/controller/person.controller";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Person ID is required" },
        { status: 400 }
      );
    }

    const result = await getPersonDetailController(id);
    if (!result) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/person/[id]] Internal Server Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch person detail" },
      { status: 500 }
    );
  }
}
