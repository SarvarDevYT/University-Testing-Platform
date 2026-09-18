import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { verifyPassword, generateToken, TOKEN_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Login va parolni kiriting" },
        { status: 400 }
      );
    }

    const user = await dbService.getUserByUsername(username.trim());
    if (!user) {
      return NextResponse.json(
        { error: "Login yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Login yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    // JWT token yaratish
    const token = generateToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as "ADMIN" | "STUDENT",
      groupName: user.groupName,
      faculty: user.faculty,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        groupName: user.groupName,
        faculty: user.faculty,
      },
    });

    // Xavfsiz HTTP-Only Cookie o'rnatish
    response.cookies.set({
      name: TOKEN_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 kun
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Tizimda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
