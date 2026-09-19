"use client";

import { useEffect, useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Bot,
  MessageSquare,
  Key,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [enabled, setEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/telegram")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setBotToken(data.settings.botToken || "");
          setChatId(data.settings.chatId || "");
          setEnabled(data.settings.enabled !== undefined ? data.settings.enabled : true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/settings/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken, chatId, enabled }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sozlamalarni saqlashda xatolik");

      setMsg({ type: "success", text: "Telegram sozlamalari muvaffaqiyatli saqlandi!" });
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Xatolik yuz berdi" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setMsg({ type: "error", text: "Iltimos, avval Bot Token va Chat ID maydonlarini to'ldiring!" });
      return;
    }

    setTesting(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/settings/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken, chatId, enabled, testSend: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test xabari bormadi");

      setMsg({ type: "success", text: "Test xabari Telegram guruhingizga/chatingizga muvaffaqiyatli bordi!" });
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Ulanishda xatolik" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Telegram Bot Integratsiyasi & Sozlamalar
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Har bir talaba test topshirishi bilan uning natijasi avtomatik tarzda Telegram guruh yoki kanalga keladi
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SOZLAMALAR FORMASI */}
        <div className="md:col-span-7">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bot Sozlamalari</h3>
                <p className="text-xs text-slate-400">Telegram bot ma&apos;lumotlarini kiriting</p>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telegram Bot Token
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-emerald-400 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    @BotFather orqali yaratilgan bot tokeni
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kanal yoki Guruh Chat ID
                  </label>
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="Masalan: -100123456789 yoki 123456789"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-emerald-400 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Kanal yoki guruh ID raqami (Guruhlarga botni admin qilib qo&apos;shish kerak)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Natijalarni yuborishni yoqish</div>
                    <div className="text-[11px] text-slate-400">Har bir imtihondan so&apos;ng avtomatik yuboriladi</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={testing}
                    onClick={handleTestSend}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {testing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Test Xabarini Yuborish</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saqlash</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* YO'RIQNOMA (QO'LLANMA) */}
        <div className="md:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>3 qadamda sozlash:</span>
            </div>

            <ol className="text-xs text-slate-300 space-y-2.5 list-decimal pl-4 leading-relaxed">
              <li>
                Telegramda <strong className="text-white">@BotFather</strong> ga kiring va <code className="text-emerald-300 bg-black/40 px-1 rounded">/newbot</code> buyrug&apos;i orqali o&apos;z botingizni oching. Berilgan <b>API tokenni</b> nusxalab oling.
              </li>
              <li>
                Botingizni natijalarni qabul qilmoqchi bo&apos;lgan <b>guruh</b> yoki <b>kanalga</b> qo&apos;shing va unga <b>Admin</b> huquqini bering.
              </li>
              <li>
                Guruh yoki kanal ID sini olish uchun <strong className="text-white">@userinfobot</strong> yoki <strong className="text-white">@GetMyIdBot</strong> dan foydalaning (odatda <code className="text-emerald-300 bg-black/40 px-1 rounded">-100...</code> bilan boshlanadi).
              </li>
            </ol>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Sozlangach, yuqoridagi <b>&quot;Test Xabarini Yuborish&quot;</b> tugmasi orqali tekshirib ko&apos;rishingiz mumkin.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
