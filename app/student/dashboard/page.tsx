"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LogOut,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  User,
  Lock,
  Users,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/format";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!isMounted) return;

        if (data?.user) {
          setUser(data.user);
          setTests(data.tests || []);
          setResults(data.results || []);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Dashboard yuklashda xatolik:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0E14] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-400 tracking-wide">
            Shaxsiy kabinet yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // Hisoblangan statistika
  const passedCount = results.filter((r) => r.passed).length;
  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce((acc, r) => acc + (r.scorePercent || 0), 0) / results.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#0C0E14] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Orqa fon nur effekti */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[350px] bg-teal-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="bg-[#0C0E14]/90 backdrop-blur-md border-b border-white/10 py-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
                UNIVER <span className="text-emerald-400">TEST</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Talaba Shaxsiy Kabineti
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white">{user?.fullName}</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {user?.groupName || "Talaba"} | {user?.faculty || "Universitet"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* ASOSIY QISM */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Talaba profili va statistika kartasi */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-500/20 shrink-0">
              {user?.fullName?.charAt(0) || "T"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Talaba Profili</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/5 border border-white/10 text-slate-300">
                  Login: @{user?.username}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Xush kelibsiz, {user?.fullName}!
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
                <span>Fakultet: <strong className="text-slate-200">{user?.faculty || "Umumiy"}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Guruh: <strong className="text-emerald-400 font-mono">{user?.groupName || "Biriktirilmagan"}</strong></span>
              </p>
            </div>
          </div>

          {/* Mini statistika bloki */}
          <div className="grid grid-cols-3 gap-3 text-xs w-full lg:w-auto">
            <div className="px-4 py-3 rounded-2xl bg-[#141822]/90 border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-medium">Topshirildi</div>
              <div className="text-lg font-bold text-white mt-0.5">{results.length} ta</div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-[#141822]/90 border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-medium">O&apos;tildi</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{passedCount} ta</div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-[#141822]/90 border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-medium">O&apos;rtacha ball</div>
              <div className="text-lg font-bold text-teal-300 mt-0.5">{avgScore}%</div>
            </div>
          </div>
        </div>

        {/* TOPSHIRILISHI MUMKIN BO'LGAN TESTLAR */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Topshirish Uchun Faol Testlar</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sizning guruhingiz yoki barcha talabalar uchun ochiq bo&apos;lgan sinovlar
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
              {tests.length} ta test mavjud
            </span>
          </div>

          {tests.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl text-slate-400 text-xs border border-white/10">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-300">Hozirda topshirish uchun faol testlar mavjud emas.</p>
              <p className="text-slate-500 text-[11px] mt-1">O&apos;qituvchingiz yangi test e&apos;lon qilganda shu yerda paydo bo&apos;ladi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => {
                const isUniversal = !test.allowedGroups || test.allowedGroups.length === 0;
                const isMyGroup = Boolean(
                  user?.groupName &&
                  test.allowedGroups?.some(
                    (g: string) => g.trim().toLowerCase() === user.groupName.trim().toLowerCase()
                  )
                );
                const isAllowed = isUniversal || isMyGroup;

                return (
                  <div
                    key={test.id}
                    className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col justify-between group ${
                      isAllowed
                        ? "border-white/10 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5"
                        : "border-white/5 opacity-75"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          {test.category || "Umumiy"}
                        </span>
                        <div className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{test.timeLimit} daqiqa</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {test.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {test.description || "Talabalarning bilimi va o'zlashtirishini baholash testi."}
                      </p>

                      {/* Guruh mavjudligi */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px]">
                        {isUniversal ? (
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Barcha guruhlarga ochiq</span>
                          </span>
                        ) : isMyGroup ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Sizning guruhingiz ({user?.groupName}) uchun ochiq</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Faqat: {test.allowedGroups.join(", ")} uchun</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        O&apos;tish bali: <strong className="text-white">{test.passingScore}%</strong>
                      </span>

                      {isAllowed ? (
                        <Link
                          href={`/exam/${test.accessCode}`}
                          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 hover:scale-105 transition-all"
                        >
                          <span>Boshlash</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span
                          className="py-2 px-3 rounded-xl bg-white/5 text-slate-500 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed"
                          title="Ushbu test sizning guruhingiz uchun mo'ljallanmagan"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Dostup yo&apos;q</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TESTLAR TARIXI VA NATIJALARI */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-400" />
                <span>Mening Test Natijalarim</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ilgari topshirilgan testlar bo&apos;yicha to&apos;liq hisobot va ballar
              </p>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl text-slate-400 text-xs border border-white/10">
              <Award className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-300">Siz hali hech qanday test topshirmadingiz.</p>
              <p className="text-slate-500 text-[11px] mt-1">Yuqoridagi faol testlardan birini tanlab, sinovdan o&apos;ting!</p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141822] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Test Nomi</th>
                      <th className="px-6 py-4">To&apos;g&apos;ri Javob</th>
                      <th className="px-6 py-4">Ball (%)</th>
                      <th className="px-6 py-4">Holat</th>
                      <th className="px-6 py-4">Sana</th>
                      <th className="px-6 py-4 text-right">Hisobot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          {r.test?.title || "Test"}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {r.correctAnswers} / {r.totalQuestions}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-white">
                          {r.scorePercent}%
                        </td>
                        <td className="px-6 py-4">
                          {r.passed ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>O&apos;tdi</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>O&apos;tmadi</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/exam/result/${r.id}`}
                            className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 font-semibold inline-flex items-center gap-1.5 transition-all text-xs"
                          >
                            <span>Natija</span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
