import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await dbService.getResultById(id);

    if (!result) {
      return NextResponse.json({ error: "Natija topilmadi" }, { status: 404 });
    }

    // Xavfsizlik: Talabaga savollarning to'g'ri javoblari (answer key) aslo yuborilmaydi!
    // Faqat talabaning o'z javobi va to'g'ri/noto'g'riligi yuboriladi
    if (result.test && result.test.questions) {
      const parsedAnswers = JSON.parse(result.answersJson || "{}");
      const safeQuestions = result.test.questions.map((q: any) => {
        const userChoice = parsedAnswers[q.id];
        const isCorrect = !!(userChoice && q.correctAnswer && userChoice.toUpperCase() === q.correctAnswer.toUpperCase());
        return {
          id: q.id,
          questionText: q.questionText,
          orderIndex: q.orderIndex,
          userChoice: userChoice || null,
          isCorrect,
        };
      });
      result.test.questions = safeQuestions;
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Natijani yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
