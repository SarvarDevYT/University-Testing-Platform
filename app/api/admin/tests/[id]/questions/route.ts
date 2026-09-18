import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

// Yangi savol qo'shish (A, B, C, D variantlar va to'g'ri javob)
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
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, points } = body;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json(
        { error: "Barcha maydonlarni (Savol va 4 ta variantni) to'ldiring!" },
        { status: 400 }
      );
    }

    const validAnswers = ["A", "B", "C", "D"];
    if (!validAnswers.includes(correctAnswer.toUpperCase())) {
      return NextResponse.json(
        { error: "To'g'ri javob A, B, C yoki D bo'lishi kerak!" },
        { status: 400 }
      );
    }

    const newQuestion = await dbService.addQuestion({
      testId,
      questionText: questionText.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctAnswer: correctAnswer.toUpperCase() as "A" | "B" | "C" | "D",
      points: parseInt(points) || 1,
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Savol qo'shishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

// Savolni o'chirish
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json({ error: "Savol ID berilmagan" }, { status: 400 });
    }

    await dbService.deleteQuestion(questionId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Savolni o'chirishda xatolik" }, { status: 500 });
  }
}
