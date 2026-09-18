"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Clock,
} from "lucide-react";

export default function AdminTestQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Yangi savol formasi
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A");
  const [points, setPoints] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/admin/tests/${id}`);
      const data = await res.json();
      if (data.test) setTest(data.test);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTest();
  }, [id]);

  // Savol qo'shish
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/tests/${id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
          points,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Savol qo'shishda xatolik");

      // Formani tozalash
      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");
      setSuccessMsg("Savol muvaffaqiyatli qo'shildi!");
      setTimeout(() => setSuccessMsg(""), 3000);

      fetchTest();
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  // Savolni o'chirish
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Haqiqatan ham ushbu savolni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/admin/tests/${id}/questions?questionId=${qId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTest();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Test savollari yuklanmoqda...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-white">Test topilmadi</h2>
        <Link href="/admin/tests" className="text-xs text-cyan-400 underline mt-2 inline-block">
          Testlar ro&apos;yxatiga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sarlavha & Ortga qaytish */}
      <div>
        <Link
          href="/admin/tests"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha testlarga qaytish</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-cyan-300 border border-indigo-500/30">
                {test.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{test.timeLimit} daqiqa</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {test.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Savollar bankini boshqarish, A, B, C, D variantlar va to&apos;g&apos;ri javoblarni belgilash
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-right self-start sm:self-auto">
            <div className="text-[10px] text-slate-400">Jami savollar</div>
            <div className="text-xl font-extrabold text-cyan-400">
              {test.questions?.length || 0} ta
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* YANGI SAVOL QO'SHISH FORMASI (5 Ustun) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl sticky top-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yangi Savol Qo&apos;shish</h3>
                <p className="text-[11px] text-slate-400">Variantlarni va to&apos;g&apos;ri javobni tanlang</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddQuestion} className="space-y-4">
              {/* Savol matni */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Savol Matni *
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Savolni to'liq matnini yozing..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Variant A, B, C, D */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Javob Variantlari *
                </label>

                {/* Variant A */}
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#1C2541] text-xs font-bold text-slate-300 flex items-center justify-center shrink-0 border border-white/10">
                    A
                  </span>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Variant A..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Variant B */}
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#1C2541] text-xs font-bold text-slate-300 flex items-center justify-center shrink-0 border border-white/10">
                    B
                  </span>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Variant B..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Variant C */}
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#1C2541] text-xs font-bold text-slate-300 flex items-center justify-center shrink-0 border border-white/10">
                    C
                  </span>
                  <input
                    type="text"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    placeholder="Variant C..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Variant D */}
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#1C2541] text-xs font-bold text-slate-300 flex items-center justify-center shrink-0 border border-white/10">
                    D
                  </span>
                  <input
                    type="text"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    placeholder="Variant D..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* To'g'ri javobni tanlash (A, B, C, D tugmalari) */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  To&apos;g&apos;ri Javob Qaysi biri? *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["A", "B", "C", "D"] as const).map((letter) => (
                    <button
                      type="button"
                      key={letter}
                      onClick={() => setCorrectAnswer(letter)}
                      className={`py-2.5 rounded-xl font-extrabold text-sm border transition-all cursor-pointer ${
                        correctAnswer === letter
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30"
                          : "bg-[#0F172A] text-slate-400 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Savolni Saqlash</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* MAVJUD SAVOLLAR RO'YXATI (7 Ustun) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Mavjud Savollar ({test.questions?.length || 0})
            </h3>
            <span className="text-xs text-slate-400">
              Yashil rang — to&apos;g&apos;ri javob
            </span>
          </div>

          {test.questions?.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center text-slate-400 text-xs border border-white/10">
              Ushbu testda hali savollar mavjud emas. Chapdagi forma orqali birinchi savolni qo&apos;shing.
            </div>
          ) : (
            <div className="space-y-4">
              {test.questions.map((q: any, idx: number) => (
                <div
                  key={q.id}
                  className="glass-panel p-5 rounded-2xl border border-white/10 relative group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-semibold text-white leading-relaxed">
                        {q.questionText}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Savolni o'chirish"
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Variantlar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-xs">
                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        q.correctAnswer === "A"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                          : "bg-black/20 border-white/5 text-slate-400"
                      }`}
                    >
                      <span className="font-bold">A)</span>
                      <span>{q.optionA}</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        q.correctAnswer === "B"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                          : "bg-black/20 border-white/5 text-slate-400"
                      }`}
                    >
                      <span className="font-bold">B)</span>
                      <span>{q.optionB}</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        q.correctAnswer === "C"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                          : "bg-black/20 border-white/5 text-slate-400"
                      }`}
                    >
                      <span className="font-bold">C)</span>
                      <span>{q.optionC}</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        q.correctAnswer === "D"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                          : "bg-black/20 border-white/5 text-slate-400"
                      }`}
                    >
                      <span className="font-bold">D)</span>
                      <span>{q.optionD}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
