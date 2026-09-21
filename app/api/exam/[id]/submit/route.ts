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

    // Faqat tizimga kirgan talabalar test topshira oladi
    if (!currentUser) {
      return NextResponse.json(
        { error: "Test topshirish uchun avval shaxsiy hisobingizga kiring!" },
        { status: 401 }
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

    // 1 ta urinish qoidasi (Anti-cheat): Tizimga kirgan talaba qayta topshira olmaydi
    if (currentUser) {
      const alreadySubmitted = await dbService.hasStudentSubmitted(actualTestId, currentUser.id);
      if (alreadySubmitted) {
        return NextResponse.json(
          { error: "Siz ushbu testni allaqachon topshirgansiz! Qayta topshirish taqiqlangan." },
          { status: 400 }
        );
      }
    }

    const studentName = currentUser ? currentUser.fullName : guestName.trim();
    const studentGroup = currentUser ? (currentUser.groupName || "") : (guestGroup?.trim() || "");

    // Guruh bo'yicha dostupni tekshirish
    const accessCheck = await dbService.isStudentAllowedForTest(actualTestId, studentGroup);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: accessCheck.reason || "Ushbu testga sizning guruhingiz ruxsat etilmagan" },
        { status: 403 }
      );
    }

    const result = await dbService.submitExam({
      testId: actualTestId,
      userId: currentUser?.id || null,
      guestName: studentName,
      guestGroup: studentGroup,
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
