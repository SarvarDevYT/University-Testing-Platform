import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";

// Barcha talabalar ro'yxati
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const students = await dbService.getStudents();
    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json({ error: "Talabalarni yuklashda xatolik" }, { status: 500 });
  }
}

// Yangi talaba yaratish (login va parol bilan)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, username, passwordPlain, faculty, groupName, phone } = body;

    if (!fullName || !username || !passwordPlain) {
      return NextResponse.json(
        { error: "Ism-familiya, login va parolni kiritish majburiy!" },
        { status: 400 }
      );
    }

    if (passwordPlain.length < 4) {
      return NextResponse.json(
        { error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak!" },
        { status: 400 }
      );
    }

    const newStudent = await dbService.createStudent({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      passwordPlain: passwordPlain.trim(),
      faculty: faculty?.trim(),
      groupName: groupName?.trim(),
      phone: phone?.trim(),
    });

    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.id,
        username: newStudent.username,
        fullName: newStudent.fullName,
        role: newStudent.role,
        faculty: newStudent.faculty,
        groupName: newStudent.groupName,
        phone: newStudent.phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Talabani qo'shishda xatolik yuz berdi" },
      { status: 400 }
    );
  }
}
