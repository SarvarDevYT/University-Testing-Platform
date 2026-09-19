import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbService } from "@/lib/db-service";
import { sendTelegramTestMessage } from "@/lib/telegram";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const settings = await dbService.getTelegramSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Sozlamalarni olishda xatolik" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const body = await req.json();
    const { botToken, chatId, enabled, testSend } = body;

    // Agar test xabar jo'natish so'ralgan bo'lsa
    if (testSend) {
      if (!botToken || !chatId) {
        return NextResponse.json(
          { error: "Bot Token va Chat ID to'ldirilgan bo'lishi kerak!" },
          { status: 400 }
        );
      }
      const testResult = await sendTelegramTestMessage(botToken, chatId);
      if (!testResult.success) {
        return NextResponse.json(
          { error: `Telegram xabari bormadi: ${testResult.message}` },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, message: "Telegram botga test xabari muvaffaqiyatli yuborildi!" });
    }

    // Sozlamalarni saqlash
    await dbService.saveTelegramSettings({
      botToken: botToken || "",
      chatId: chatId || "",
      enabled: enabled !== undefined ? enabled : true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Sozlamalarni saqlashda xatolik" },
      { status: 500 }
    );
  }
}
