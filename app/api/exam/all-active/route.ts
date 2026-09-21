import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const tests = await dbService.getTests(true);
    return NextResponse.json({ tests });
  } catch (error: any) {
    console.error("All active tests error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
