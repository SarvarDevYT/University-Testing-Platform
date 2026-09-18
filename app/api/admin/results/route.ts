import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const results = await dbService.getAllResults();
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: "Natijalarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    await dbService.deleteAllResults();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Natijalarni tozalashda xatolik" }, { status: 500 });
  }
}
