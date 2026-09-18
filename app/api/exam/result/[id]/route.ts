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

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Natijani yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
