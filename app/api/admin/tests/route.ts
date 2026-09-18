import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

// Barcha testlarni olish (Admin)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const tests = await dbService.getTests(false);
    return NextResponse.json({ tests });
  } catch (error: any) {
    return NextResponse.json({ error: "Testlarni yuklashda xatolik" }, { status: 500 });
  }
}

// Yangi test yaratish
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, timeLimit, passingScore } = body;

    if (!title) {
      return NextResponse.json({ error: "Test nomini kiriting" }, { status: 400 });
    }

    const newTest = await dbService.createTest({
      title: title.trim(),
      description: description?.trim() || null,
      category: category?.trim() || "Umumiy",
      timeLimit: parseInt(timeLimit) || 20,
      passingScore: parseInt(passingScore) || 60,
      isActive: true,
    });

    return NextResponse.json({ success: true, test: newTest });
  } catch (error: any) {
    return NextResponse.json({ error: "Test yaratishda xatolik" }, { status: 500 });
  }
}
