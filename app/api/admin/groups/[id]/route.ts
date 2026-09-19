import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

// Guruh tafsilotlari (talabalari va testlari)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { id } = await params;
    const data = await dbService.getGroupById(id);

    if (!data) {
      return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Guruhni yuklashda xatolik" },
      { status: 500 }
    );
  }
}

// Guruhni tahrirlash
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await dbService.updateGroup(id, body);
    return NextResponse.json({ success: true, group: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Guruhni yangilashda xatolik" },
      { status: 500 }
    );
  }
}

// Guruhni o'chirish
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { id } = await params;
    await dbService.deleteGroup(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Guruhni o'chirishda xatolik" },
      { status: 500 }
    );
  }
}
