import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

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

    return NextResponse.json({ test });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Testni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
