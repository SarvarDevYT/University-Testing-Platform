import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ID yoki accessCode bo'yicha qidirish
    let test = await dbService.getTestById(id, false);
    if (!test) {
      test = await dbService.getTestByAccessCode(id);
    }

    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    if (!test.isActive) {
      return NextResponse.json(
        { error: "Ushbu test hozirda faol emas" },
        { status: 403 }
      );
    }

    const currentUser = await getCurrentUser();

    // Guruh bo'yicha dostupni tekshirish
    const accessCheck = await dbService.isStudentAllowedForTest(test.id, currentUser?.groupName);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        {
          error: accessCheck.reason,
          groupRestricted: true,
          allowedGroups: accessCheck.allowedGroups,
          testTitle: test.title,
          currentUser: currentUser ? { fullName: currentUser.fullName, groupName: currentUser.groupName } : null,
        },
        { status: 403 }
      );
    }

    let alreadySubmitted = false;
    if (currentUser) {
      alreadySubmitted = await dbService.hasStudentSubmitted(test.id, currentUser.id);
    }

    return NextResponse.json({ test, alreadySubmitted, currentUser });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Testni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
