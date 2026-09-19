import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { id: testId } = await params;
    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Savollar ro'yxati bo'sh yoki noto'g'ri formatda" },
        { status: 400 }
      );
    }

    // Har bir savolni tekshirish
    const validQuestions = [];
    for (const q of questions) {
      if (
        q.questionText &&
        q.optionA &&
        q.optionB &&
        q.optionC &&
        q.optionD &&
        ["A", "B", "C", "D"].includes((q.correctAnswer || "").toUpperCase())
      ) {
        validQuestions.push({
          questionText: q.questionText.trim(),
          optionA: q.optionA.trim(),
          optionB: q.optionB.trim(),
          optionC: q.optionC.trim(),
          optionD: q.optionD.trim(),
          correctAnswer: q.correctAnswer.toUpperCase() as "A" | "B" | "C" | "D",
          points: parseInt(q.points) || 1,
        });
      }
    }

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: "Hech qanday to'g'ri formatdagi savol topilmadi. Har bir savolda 4 ta variant (A, B, C, D) va to'g'ri javob ko'rsatilgan bo'lishi shart!" },
        { status: 400 }
      );
    }

    const imported = await dbService.importQuestions(testId, validQuestions);

    return NextResponse.json({
      success: true,
      count: imported.length,
      questions: imported,
    });
  } catch (error: any) {
    console.error("Import questions error:", error);
    return NextResponse.json(
      { error: error.message || "Savollarni import qilishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
