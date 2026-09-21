"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Home,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatDate } from "@/lib/format";
import { sfx } from "@/lib/sfx";

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/exam/result/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setResult(data.result);
          if (data.result.passed) {
            // Bayramona confetti va g'alaba tovushi
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
            sfx.playVictory();
          } else {
            // Sinovdan o'tolmagandagi mayin ogohlantiruvchi signal
            sfx.playDefeat();
          }
        } else {
          setError(data.error || "Natija topilmadi");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0E14] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-400">Natijalar tahlil qilinmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#0C0E14] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center border border-white/10 shadow-2xl">
          <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Natija topilmadi</h2>
          <p className="text-xs text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-block shadow-lg shadow-emerald-600/30 transition-all"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const parsedAnswers = JSON.parse(result.answersJson || "{}");
  const test = result.test;
  const questions = test?.questions || [];

  return (
    <div className="min-h-screen bg-[#0C0E14] text-slate-100 py-10 px-4 sm:px-8 relative overflow-hidden">
      {/* Orqa fon nur effekti */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[350px] bg-teal-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* NAVIGATSIYA & CHOP ETISH TUGMALARI */}
        <div className="no-print flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Shaxsiy kabinetga qaytish</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#141822] hover:bg-[#1A1F2C] text-xs font-bold text-emerald-300 border border-white/10 hover:border-emerald-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish / PDF</span>
          </button>
        </div>

        {/* ASOSIY NATIJA KARTASI (SERTIFIKAT FORMASIDA) */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center border-b border-white/10 pb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>

            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universitet Raqamli Baholash Hujjati</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {test?.title || "Test Natijasi"}
            </h1>

            <p className="text-xs text-slate-400 mt-2">
              Sinaluvchi: <strong className="text-white">{result.user?.fullName || result.guestName}</strong>
              {(result.user?.groupName || result.guestGroup) && (
                <span> | Guruh: <strong className="text-emerald-400 font-mono">{result.user?.groupName || result.guestGroup}</strong></span>
              )}
            </p>
          </div>

          {/* Katta Ball & Foiz */}
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div
              className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl mb-5 ${
                result.passed
                  ? "border-emerald-400 bg-emerald-950/50 shadow-emerald-500/20"
                  : "border-rose-400 bg-rose-950/50 shadow-rose-500/20"
              }`}
            >
              <span className="text-4xl font-black text-white">
                {result.scorePercent}%
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-300 mt-0.5">
                {result.correctAnswers}/{result.totalQuestions} to&apos;g&apos;ri
              </span>
            </div>

            <div className="inline-flex items-center gap-2">
              {result.passed ? (
                <div className="px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sinovdan Muvaffaqiyatli O&apos;tdingiz!</span>
                </div>
              ) : (
                <div className="px-5 py-2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/10">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Yetarli ball to&apos;planmadi (O&apos;tmadi)</span>
                </div>
              )}
            </div>
          </div>

          {/* Tafsilotlar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 px-5 rounded-2xl bg-[#141822]/80 border border-white/5 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Jami savollar</div>
              <div className="font-bold text-white mt-0.5">{result.totalQuestions} ta</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">To&apos;g&apos;ri javoblar</div>
              <div className="font-bold text-emerald-400 mt-0.5">{result.correctAnswers} ta</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Sarflangan vaqt</div>
              <div className="font-bold text-teal-300 mt-0.5">
                {Math.floor(result.timeSpentSeconds / 60)} daq {result.timeSpentSeconds % 60} sek
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Sana</div>
              <div className="font-bold text-slate-200 mt-0.5 font-mono">
                {formatDate(result.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* SAVOLLARNING TO'LIQ TAHLILI */}
        {questions.length > 0 && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Savollar Holati</span>
            </h3>

            <div className="space-y-4">
              {questions.map((q: any, idx: number) => {
                const userChoice = q.userChoice || parsedAnswers[q.id];
                const isCorrect = q.isCorrect !== undefined ? q.isCorrect : false;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-colors ${
                      isCorrect
                        ? "bg-emerald-950/20 border-emerald-500/20"
                        : "bg-rose-950/20 border-rose-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-xs font-semibold text-white">
                        <span className="font-bold text-emerald-400 mr-2">{idx + 1}.</span>
                        {q.questionText}
                      </div>

                      {isCorrect ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                          To&apos;g&apos;ri
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 shrink-0 border border-rose-500/30">
                          Noto&apos;g&apos;ri
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-0.5 mt-2 font-mono">
                      <div>
                        Sizning javobingiz:{" "}
                        <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>
                          {userChoice || "Belgilanmagan"}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASTKI TUGMALAR */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141822] hover:bg-[#1A1F2C] border border-white/10 text-xs font-bold text-slate-300 text-center transition-all"
          >
            Bosh sahifaga qaytish
          </Link>
          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white text-center shadow-lg shadow-emerald-600/30 transition-all"
          >
            Shaxsiy kabinetga o&apos;tish
          </Link>
        </div>
      </div>
    </div>
  );
}
