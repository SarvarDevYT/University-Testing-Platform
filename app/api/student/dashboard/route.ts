import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 }
      );
    }

    // O'quvchi uchun barcha faol testlar
    const allActiveTests = await dbService.getTests(true);

    // O'quvchining o'z topshirgan natijalari
    const results = await dbService.getStudentResults(user.id);

    return NextResponse.json({
      success: true,
      user,
      tests: allActiveTests,
      results,
    });
  } catch (error: any) {
    console.error("Student dashboard API error:", error);
    return NextResponse.json(
      { error: "Ma'lumotlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
