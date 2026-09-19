import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

// Barcha guruhlarni olish (Admin)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const groups = await dbService.getGroups();
    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Guruhlarni yuklashda xatolik" },
      { status: 500 }
    );
  }
}

// Yangi guruh yaratish
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const body = await req.json();
    const { name, faculty, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Guruh nomi kiritilishi shart" }, { status: 400 });
    }

    const newGroup = await dbService.createGroup({
      name: name.trim(),
      faculty: faculty?.trim() || null,
      description: description?.trim() || null,
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Guruh yaratishda xatolik" },
      { status: 500 }
    );
  }
}
