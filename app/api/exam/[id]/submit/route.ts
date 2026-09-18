import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { answers, timeSpentSeconds, guestName, guestGroup } = body;

    // Tizimga kirgan talaba bo'lsa uni olamiz
    const currentUser = await getCurrentUser();

    // Agar na login qilingan talaba, na guestName bo'lsa xato
    if (!currentUser && !guestName) {
      return NextResponse.json(
        { error: "Test topshiruvchining ism-familiyasi ko'rsatilmadi" },
        { status: 400 }
      );
    }

    // Testni aniqlash (id yoki accessCode)
    let actualTestId = id;
    let test = await dbService.getTestById(id, false);
    if (!test) {
      test = await dbService.getTestByAccessCode(id);
      if (test) {
        actualTestId = test.id;
      }
    }

    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    const result = await dbService.submitExam({
      testId: actualTestId,
      userId: currentUser?.id || null,
      guestName: currentUser ? currentUser.fullName : guestName.trim(),
      guestGroup: currentUser ? (currentUser.groupName || "") : (guestGroup?.trim() || ""),
      answers: answers || {},
      timeSpentSeconds: parseInt(timeSpentSeconds) || 0,
    });

    return NextResponse.json({
      success: true,
      resultId: result.id,
      scorePercent: result.scorePercent,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      passed: result.passed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Testni topshirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
