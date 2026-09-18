"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  User,
  GraduationCap,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Test ma'lumotlari
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Foydalanuvchi ma'lumotlari
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestName, setGuestName] = useState("");
  const [guestGroup, setGuestGroup] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  // Test holati
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 1. Foydalanuvchi va Testni yuklash
  useEffect(() => {
    async function init() {
      try {
        // Tizimdagi userni tekshirish
        const userRes = await fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (userRes?.user) {
          setCurrentUser(userRes.user);
          setGuestName(userRes.user.fullName);
          setGuestGroup(userRes.user.groupName || "");
        }

        // Testni yuklash
        const testRes = await fetch(`/api/exam/${id}`);
        const testData = await testRes.json();

        if (!testRes.ok) {
          throw new Error(testData.error || "Testni yuklab bo'lmadi");
        }

        setTest(testData.test);
        setTimeLeftSeconds((testData.test.timeLimit || 20) * 60);

        // LocalStorage dan avvalgi saqlangan javoblarni tiklash (agar mavjud bo'lsa)
        const saved = localStorage.getItem(`exam_answers_${testData.test.id}`);
        if (saved) {
          try {
            setAnswers(JSON.parse(saved));
          } catch {}
        }
      } catch (err: any) {
        setError(err.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  // 2. Taymer hisobi
  useEffect(() => {
    if (!isStarted || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeftSeconds]);

  // Javobni tanlash va avtomatik saqlash
  const handleSelectOption = (questionId: string, option: string) => {
    const updated = { ...answers, [questionId]: option };
    setAnswers(updated);
    if (test?.id) {
      localStorage.setItem(`exam_answers_${test.id}`, JSON.stringify(updated));
    }
  };

  // Vaqt tugaganda avtomatik topshirish
  const handleAutoSubmit = () => {
    alert("Vaqt tugadi! Test avtomatik tarzda yakunlanmoqda.");
    submitTest();
  };

  // Testni serverga topshirish
  const submitTest = async () => {
    if (submitting || !test) return;
    setSubmitting(true);

    const totalSeconds = (test.timeLimit || 20) * 60;
    const timeSpent = Math.max(1, totalSeconds - timeLeftSeconds);

    try {
      const res = await fetch(`/api/exam/${test.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeSpentSeconds: timeSpent,
          guestName: currentUser?.fullName || guestName,
          guestGroup: currentUser?.groupName || guestGroup,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Natijani yuborib bo'lmadi");

      // LocalStorage ni tozalash
      localStorage.removeItem(`exam_answers_${test.id}`);

      // Natijalar sahifasiga o'tish
      router.push(`/exam/result/${data.resultId}`);
    } catch (err: any) {
      alert("Xatolik: " + err.message);
      setSubmitting(false);
    }
  };

  // Daqiqa va soniya formati
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Test yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center border border-white/10">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Test ochilmadi</h2>
          <p className="text-xs text-slate-400 mb-6">{error || "Bunday test mavjud emas yoki u nofaol"}</p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-block"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const answeredCount = Object.keys(answers).length;

  // BOSHLASH OYNASI (Talaba ism-familiyasini tasdiqlash)
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-950 text-cyan-300 border border-indigo-500/20">
              {test.category}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-3">{test.title}</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {test.description || "Ushbu test bo'yicha belgilangan vaqt ichida savollarga javob bering."}
            </p>
          </div>

          {/* Qoidalar ko'rsatkichlari */}
          <div className="grid grid-cols-3 gap-3 py-3 px-4 rounded-2xl bg-black/40 border border-white/5 text-center text-xs mb-6">
            <div>
              <div className="text-[10px] text-slate-400">Savollar soni</div>
              <div className="font-extrabold text-white mt-0.5">{questions.length} ta</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Berilgan vaqt</div>
              <div className="font-extrabold text-cyan-400 mt-0.5">{test.timeLimit} daqiqa</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">O&apos;tish bali</div>
              <div className="font-extrabold text-emerald-400 mt-0.5">{test.passingScore}%</div>
            </div>
          </div>

          {/* Talaba ma'lumotlari */}
          {currentUser ? (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{currentUser.fullName}</div>
                <div className="text-[11px] text-cyan-300 font-mono">
                  Guruh: {currentUser.groupName || "-"} | {currentUser.faculty || "-"}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  To&apos;liq Ism-Familiyangiz *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Masalan: Aliyev Valijon"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Guruhingiz / Fakultetingiz
                </label>
                <input
                  type="text"
                  value={guestGroup}
                  onChange={(e) => setGuestGroup(e.target.value)}
                  placeholder="Masalan: 210-guruh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (!currentUser && !guestName.trim()) {
                alert("Iltimos, ism-familiyangizni kiriting!");
                return;
              }
              setIsStarted(true);
            }}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Testni Boshlash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // TEST TOPSHIRISH ASOSIY INTERFEYSI (EXAM ENGINE)
  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      {/* TEPADAGI PANEL (Taymer va Test Nomi) */}
      <header className="bg-[#080E21] border-b border-white/10 py-3.5 px-4 sm:px-8 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              {test.category}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {test.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Real-vaqt Taymer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold ${
                timeLeftSeconds < 120
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                  : "bg-indigo-950/60 text-cyan-300 border-indigo-500/30"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            {/* Yakunlash tugmasi */}
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Yakunlash</span>
            </button>
          </div>
        </div>
      </header>

      {/* ASOSIY OYNA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* CHAP PANEL: Savollar navigatsiyasi */}
        <aside className="w-full lg:w-72 glass-panel p-5 rounded-3xl border border-white/10 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Savollar ro&apos;yxati
              </span>
              <span className="text-[11px] text-cyan-400 font-semibold font-mono">
                {answeredCount} / {questions.length} yechildi
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                style={{
                  width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
                }}
              />
            </div>

            {/* 1, 2, 3... tugmalar paneli */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q: any, index: number) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentQuestionIdx === index;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(index)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center relative ${
                      isCurrent
                        ? "bg-indigo-600 text-white ring-2 ring-cyan-400 shadow-lg"
                        : isAnswered
                        ? "bg-emerald-600/80 text-white"
                        : "bg-[#0F172A] text-slate-400 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/5 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Javob berilgan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-cyan-400" />
              <span>Hozirgi savol</span>
            </div>
          </div>
        </aside>

        {/* O'NG / O'RTA PANEL: Joriy Savol va Variantlar */}
        <section className="flex-1 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
          {currentQ ? (
            <div>
              {/* Savol sarlavhasi */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-lg bg-indigo-950/80 text-cyan-300 font-bold text-xs border border-indigo-500/20">
                  {currentQuestionIdx + 1}-savol
                </span>
                <span className="text-xs text-slate-400 font-medium">1 ball</span>
              </div>

              {/* Savol matni */}
              <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed mb-8">
                {currentQ.questionText}
              </h3>

              {/* VARIANTLAR (A, B, C, D) */}
              <div className="space-y-3.5">
                {[
                  { key: "A", text: currentQ.optionA },
                  { key: "B", text: currentQ.optionB },
                  { key: "C", text: currentQ.optionC },
                  { key: "D", text: currentQ.optionD },
                ].map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/30 border-cyan-400 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-cyan-400"
                          : "bg-[#0F172A]/80 border-white/5 text-slate-300 hover:bg-[#16203B] hover:border-white/15"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-cyan-400 text-black border-cyan-300"
                            : "bg-[#1C2541] text-slate-300 border-white/10"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Savol mavjud emas.
            </div>
          )}

          {/* PASTKI AMALLAR TUGMALARI (Oldingi, Keyingi) */}
          <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-5 py-2.5 rounded-xl bg-[#1C2541] hover:bg-[#253259] text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))
                }
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Keyingi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setConfirmModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Testni topshirish</span>
              </button>
            )}
          </div>
        </section>
      </main>

      {/* YAKUNLASHNI TASDIQLASH MODALI */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Testni yakunlaysizmi?
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Siz <strong className="text-white">{questions.length}</strong> ta savoldan{" "}
              <strong className="text-cyan-400">{answeredCount}</strong> tasiga javob berdingiz.
              {answeredCount < questions.length && (
                <span className="block text-amber-400 mt-1">
                  ⚠️ Diqqat: {questions.length - answeredCount} ta savol belgilanmagan!
                </span>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#1C2541] hover:bg-[#253259] text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Davom ettirish
              </button>
              <button
                onClick={submitTest}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Baholanmoqda..." : "Ha, topshirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
