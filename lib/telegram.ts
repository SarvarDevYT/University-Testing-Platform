import { dbService } from "./db-service";

interface TelegramResultPayload {
  studentName: string;
  groupName?: string | null;
  faculty?: string | null;
  testTitle: string;
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentSeconds: number;
  submittedAt: Date;
}

export async function sendTelegramResultNotification(payload: TelegramResultPayload): Promise<boolean> {
  try {
    const settings = await dbService.getTelegramSettings();
    if (!settings.enabled || !settings.botToken || !settings.chatId) {
      return false; // Telegram sozlanmagan bo'lsa yoki o'chirilgan bo'lsa
    }

    const durationMin = Math.floor(payload.timeSpentSeconds / 60);
    const durationSec = payload.timeSpentSeconds % 60;
    const statusBadge = payload.passed ? "✅ O'TDI (Muvaffaqiyatli)" : "❌ O'TMADI";

    // Kun:Oy:Yil format
    const d = new Date(payload.submittedAt);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const dateFormatted = `${day}:${month}:${year} ${hours}:${minutes}`;

    const text = `🎓 <b>Yangi Test Natijasi!</b>\n\n` +
      `👤 <b>Talaba:</b> ${escapeHtml(payload.studentName)}\n` +
      `👥 <b>Guruh:</b> ${escapeHtml(payload.groupName || "Umumiy")}\n` +
      `🏛 <b>Fakultet:</b> ${escapeHtml(payload.faculty || "-")}\n` +
      `📚 <b>Fan/Test:</b> ${escapeHtml(payload.testTitle)}\n` +
      `🎯 <b>To'g'ri javoblar:</b> ${payload.correctAnswers} / ${payload.totalQuestions}\n` +
      `📊 <b>Natija:</b> <b>${payload.scorePercent}%</b>\n` +
      `📌 <b>Holat:</b> ${statusBadge}\n` +
      `⏱ <b>Sarflangan vaqt:</b> ${durationMin} daq ${durationSec} sek\n` +
      `📅 <b>Topshirilgan vaqt:</b> ${dateFormatted}\n\n` +
      `🏛 <i>Universitet Test & Monitoring Tizimi</i>`;

    const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("Telegram notification error:", error);
    return false;
  }
}

export async function sendTelegramTestMessage(botToken: string, chatId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const text = `✅ <b>Universitet Test Tizimi: Telegram Bot Ulandi!</b>\n\n` +
      `Ushbu chat/kanalga talabalarning test natijalari real vaqt rejimida avtomatik kelib turadi.\n\n` +
      `⏱ <i>Sana: ${new Date().toLocaleString("uz-UZ")}</i>`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      return { success: true };
    }
    return { success: false, message: data.description || "Telegram API xatoligi" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Ulanishda xatolik" };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
