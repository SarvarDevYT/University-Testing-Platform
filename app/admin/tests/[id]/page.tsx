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
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
  Check,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminTestQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Rejim: "single" (bittalab kiritish) yoki "bulk" (ommaviy matn/excel)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [bulkMode, setBulkMode] = useState<"text" | "excel">("text");

  // Yangi savol formasi (single)
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

  // Ommaviy matn formasi (bulk text)
  const [bulkText, setBulkText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");

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

  // Savolni bittalab qo'shish
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

  // Matndan savollarni avtomatik ajratib olish (Smart Parser)
  const parseQuestionsFromText = (text: string) => {
    if (!text.trim()) {
      setParsedQuestions([]);
      return;
    }

    const lines = text.split(/\r?\n/);
    const questions: any[] = [];
    let currentQ: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Savol boshlanishi (masalan: "1. Savol..." yoki "1) Savol..." yoki "Savol 1:")
      const qMatch = line.match(/^(\d+[\.\)]\s*|\#\s*|Savol\s*\d*[\:\.]\s*)(.+)/i);

      // Variantlar (A), B), C), D) yoki A., B., C., D.)
      const optMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);

      // To'g'ri javob belgisi (masalan: "Javob: A", "To'g'ri javob: B", "Answer: C")
      const ansMatch = line.match(/^(?:Javob|To'?g'?ri\s*javob|Answer|Ans)[\s\:\-]+([A-D])/i);

      if (qMatch && (!currentQ || (currentQ.optionA && currentQ.optionB))) {
        if (currentQ && currentQ.questionText && currentQ.optionA && currentQ.optionB) {
          questions.push(currentQ);
        }
        currentQ = {
          questionText: qMatch[2].trim(),
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
          points: 1,
        };
      } else if (ansMatch && currentQ) {
        currentQ.correctAnswer = ansMatch[1].toUpperCase();
      } else if (optMatch && currentQ) {
        const letter = optMatch[1].toUpperCase();
        const text = optMatch[2].trim();
        if (letter === "A") currentQ.optionA = text;
        else if (letter === "B") currentQ.optionB = text;
        else if (letter === "C") currentQ.optionC = text;
        else if (letter === "D") currentQ.optionD = text;
      } else if (currentQ && !currentQ.optionA) {
        // Savol matni ko'p qatorli bo'lsa
        currentQ.questionText += " " + line;
      }
    }

    if (currentQ && currentQ.questionText && currentQ.optionA && currentQ.optionB) {
      questions.push(currentQ);
    }

    setParsedQuestions(questions);
  };

  // Excel fayl yuklash va savollarni o'qish
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        const parsed = rawData
          .map((r) => {
            const qText = r["Savol"] || r["Savol matni"] || r["Question"] || "";
            const a = r["A"] || r["A varianti"] || r["Option A"] || "";
            const b = r["B"] || r["B varianti"] || r["Option B"] || "";
            const c = r["C"] || r["C varianti"] || r["Option C"] || "";
            const d = r["D"] || r["D varianti"] || r["Option D"] || "";
            const ans = String(r["Javob"] || r["To'g'ri javob"] || r["Correct"] || "A").trim().toUpperCase();

            return {
              questionText: String(qText).trim(),
              optionA: String(a).trim(),
              optionB: String(b).trim(),
              optionC: String(c).trim(),
              optionD: String(d).trim(),
              correctAnswer: ["A", "B", "C", "D"].includes(ans) ? ans : "A",
              points: parseInt(r["Ball"] || r["Points"]) || 1,
            };
          })
          .filter((q) => q.questionText && q.optionA && q.optionB);

        if (parsed.length === 0) {
          setBulkError("Faylda to'g'ri ustunli savollar topilmadi. Ustunlar: Savol, A, B, C, D, Javob");
          return;
        }

        setParsedQuestions(parsed);
      } catch (err: any) {
        setBulkError("Faylni o'qishda xatolik: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Savollar Excel shablonini yuklab olish
  const downloadQuestionsTemplate = () => {
    const sample = [
      {
        "Savol": "Algoritmlashda eng qulay qidiruv usuli qaysi?",
        "A": "Binary Search",
        "B": "Linear Search",
        "C": "Random Search",
        "D": "Brute Force",
        "Javob": "A",
        "Ball": 1,
      },
      {
        "Savol": "HTTP 404 xatosi nimani bildiradi?",
        "A": "Server xatosi",
        "B": "Resurs topilmadi",
        "C": "Ruxsat yo'q",
        "D": "Muvaffaqiyatli bajarildi",
        "Javob": "B",
        "Ball": 1,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Savollar");
    XLSX.writeFile(wb, "Savollar_Yuklash_Shabloni.xlsx");
  };

  // Ommaviy savollarni serverga yuborish
  const handleExecuteBulkImport = async () => {
    if (parsedQuestions.length === 0) return;
    setBulkSubmitting(true);
    setBulkError("");
    setBulkSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/tests/${id}/questions/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: parsedQuestions }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Savollarni yuklashda xatolik");

      setBulkSuccessMsg(`${data.count} ta savol muvaffaqiyatli testga qo'shildi!`);
      setBulkText("");
      setParsedQuestions([]);
      setTimeout(() => setBulkSuccessMsg(""), 4000);
      fetchTest();
    } catch (err: any) {
      setBulkError(err.message || "Xatolik yuz berdi");
    } finally {
      setBulkSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Test savollari yuklanmoqda...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-white">Test topilmadi</h2>
        <Link href="/admin/tests" className="text-xs text-emerald-400 underline mt-2 inline-block">
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha testlarga qaytish</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
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
              Savollar banki: bittalab yoki Word/Excel orqali ommaviy kiritish
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-right self-start sm:self-auto">
            <div className="text-[10px] text-slate-400">Jami savollar</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {test.questions?.length || 0} ta
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CHAP USTUN: SAVOL QO'SHISH PANELI (5 Ustun) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl sticky top-6 space-y-4">
            {/* Rejimni tanlash tugmalari */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0A0D14] border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("single")}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "single"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Bittalab Kiritish
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bulk")}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "bulk"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Ommaviy Yuklash (Matn/Excel)
              </button>
            </div>

            {/* TAB 1: BITTALAB SAVOL QO'SHISH */}
            {activeTab === "single" && (
              <div>
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Savol Matni *
                    </label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Savol matnini yozing..."
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Javob Variantlari *
                    </label>

                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const val = letter === "A" ? optionA : letter === "B" ? optionB : letter === "C" ? optionC : optionD;
                      const setVal = letter === "A" ? setOptionA : letter === "B" ? setOptionB : letter === "C" ? setOptionC : setOptionD;
                      return (
                        <div key={letter} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#141822] text-xs font-bold text-slate-300 flex items-center justify-center shrink-0 border border-white/10">
                            {letter}
                          </span>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            placeholder={`Variant ${letter}...`}
                            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      To&apos;g&apos;ri Javobni Tanlang *
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
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
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
            )}

            {/* TAB 2: OMMAVIY YUKLASH (MATN YOKI EXCEL) */}
            {activeTab === "bulk" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setBulkMode("text")}
                    className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bulkMode === "text"
                        ? "bg-white/15 text-emerald-300"
                        : "bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Word / Matn orqali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkMode("excel")}
                    className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bulkMode === "excel"
                        ? "bg-white/15 text-emerald-300"
                        : "bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel (.xlsx) orqali</span>
                  </button>
                </div>

                {bulkError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bulkError}</span>
                  </div>
                )}

                {bulkSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{bulkSuccessMsg}</span>
                  </div>
                )}

                {/* MATN REJIMI */}
                {bulkMode === "text" && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-400">
                      Word yoki fayldagi savollarni quyidagi formatda nusxalab tashlang:
                      <pre className="p-2 mt-1 rounded-lg bg-black/40 text-[10px] font-mono text-emerald-300">
{`1. Algoritmning asosiy xossasi nima?
A) Diskretlik
B) Cheksizlik
C) Murakkablik
D) Tasodifiylik
Javob: A`}
                      </pre>
                    </div>

                    <textarea
                      value={bulkText}
                      onChange={(e) => {
                        setBulkText(e.target.value);
                        parseQuestionsFromText(e.target.value);
                      }}
                      placeholder="Savollar matnini shu yerga tashlang..."
                      rows={9}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}

                {/* EXCEL REJIMI */}
                {bulkMode === "excel" && (
                  <div className="space-y-3">
                    <button
                      onClick={downloadQuestionsTemplate}
                      type="button"
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Excel Shablonini Yuklab Olish (.xlsx)</span>
                    </button>

                    <div className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl p-5 text-center transition-all">
                      <input
                        type="file"
                        id="questions-excel-input"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                      />
                      <label htmlFor="questions-excel-input" className="cursor-pointer space-y-2 block">
                        <Upload className="w-7 h-7 text-emerald-400 mx-auto" />
                        <div className="text-xs font-bold text-white">
                          Savollar Excel faylini tanlang
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Ustunlar: Savol, A, B, C, D, Javob
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* PARSE NATIJASI VA SAQLASH */}
                {parsedQuestions.length > 0 && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>Aniqlangan savollar:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px]">
                        {parsedQuestions.length} ta
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Barcha savollar to&apos;g&apos;ri formatlandi va testga kiritishga tayyor.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={parsedQuestions.length === 0 || bulkSubmitting}
                  onClick={handleExecuteBulkImport}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {bulkSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{parsedQuestions.length > 0 ? `${parsedQuestions.length} ta Savolni Qo'shish` : "Savollarni Kiritish"}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* O'NG USTUN: MAVJUD SAVOLLAR RO'YXATI (7 Ustun) */}
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
              Ushbu testda hali savollar mavjud emas. Chapdagi forma orqali bittalab yoki Word/Excel orqali ommaviy qo&apos;shing.
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
                      <span className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
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
