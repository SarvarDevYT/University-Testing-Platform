import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const body = await req.json();
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "Talabalar ro'yxati bo'sh yoki noto'g'ri formatda" },
        { status: 400 }
      );
    }

    const imported = await dbService.importStudents(students);

    return NextResponse.json({
      success: true,
      count: imported.length,
      students: imported,
    });
  } catch (error: any) {
    console.error("Import students error:", error);
    return NextResponse.json(
      { error: error.message || "Talabalarni import qilishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
