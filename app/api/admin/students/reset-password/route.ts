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
    const { studentId, newPassword } = body;

    if (!studentId || !newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    await dbService.resetStudentPassword(studentId, newPassword);

    return NextResponse.json({
      success: true,
      message: "Talaba paroli muvaffaqiyatli yangilandi",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Parolni yangilashda xatolik" },
      { status: 500 }
    );
  }
}
