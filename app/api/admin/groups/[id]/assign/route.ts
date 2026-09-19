import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

export async function POST(
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
    const { action, studentIds, testIds, studentId } = body;

    const groupData = await dbService.getGroupById(id);
    if (!groupData) {
      return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
    }

    const groupName = groupData.group.name;

    if (action === "assign_students" && Array.isArray(studentIds)) {
      await dbService.assignStudentsToGroup(groupName, studentIds);
      return NextResponse.json({ success: true, message: "Talabalar guruhga biriktirildi" });
    }

    if (action === "remove_student" && studentId) {
      await dbService.removeStudentFromGroup(studentId);
      return NextResponse.json({ success: true, message: "Talaba guruhdan chiqarildi" });
    }

    if (action === "assign_tests" && Array.isArray(testIds)) {
      await dbService.assignTestsToGroup(groupName, testIds);
      return NextResponse.json({ success: true, message: "Guruhga testlar dostup biriktirildi" });
    }

    return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Amalni bajarishda xatolik" },
      { status: 500 }
    );
  }
}
