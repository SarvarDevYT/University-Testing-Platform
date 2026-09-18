import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

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
    const test = await dbService.getTestById(id, true); // Admin uchun to'g'ri javoblari bilan!
    if (!test) {
      return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error: any) {
    return NextResponse.json({ error: "Testni yuklashda xatolik" }, { status: 500 });
  }
}

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

    const updated = await dbService.updateTest(id, body);
    return NextResponse.json({ success: true, test: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Testni yangilashda xatolik" }, { status: 500 });
  }
}

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
    await dbService.deleteTest(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Testni o'chirishda xatolik" }, { status: 500 });
  }
}
