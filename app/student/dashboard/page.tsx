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
  ExternalLink,
  Lock,
  Users,
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
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Shaxsiy kabinet yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-[#080E21] border-b border-white/10 py-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-wide">
                UNIVER <span className="text-cyan-400">TEST</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Talaba Shaxsiy Kabineti</div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white">{user?.fullName}</div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {user?.groupName || "Talaba"} | {user?.faculty || "Universitet"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* ASOSIY QISM */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Talaba profili kartasi */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-2xl">
              {user?.fullName?.charAt(0) || "T"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Xush kelibsiz, {user?.fullName}!
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Fakultet: <strong className="text-slate-300">{user?.faculty || "-"}</strong> | Guruh:{" "}
                <strong className="text-cyan-400 font-mono">{user?.groupName || "-"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400">Topshirilgan testlar</div>
              <div className="text-lg font-bold text-cyan-400">{results.length} ta</div>
            </div>
          </div>
        </div>

        {/* TOPSHIRILISHI MUMKIN BO'LGAN TESTLAR */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Topshirish Uchun Faol Testlar</span>
            </h2>
            <span className="text-xs text-slate-400">{tests.length} ta mavjud</span>
          </div>

          {tests.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-400 text-xs border border-white/10">
              Hozirda topshirish uchun faol testlar yo&apos;q.
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
                    className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                      isAllowed
                        ? "border-white/10 hover:border-indigo-500/40"
                        : "border-white/5 opacity-80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-cyan-300 border border-indigo-500/30">
                          {test.category}
                        </span>
                        <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{test.timeLimit} daqiqa</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {test.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {test.description || "Talabalarning bilimi va o'zlashtirishini baholash testi."}
                      </p>

                      {/* Guruh mavjudligi */}
                      <div className="mt-3 pt-2 flex items-center gap-1.5 text-[11px]">
                        {isUniversal ? (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            Barcha guruhlarga ochiq
                          </span>
                        ) : isMyGroup ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-400" />
                            Sizning guruhingiz ({user.groupName}) uchun ochiq
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-400" />
                            Faqat: {test.allowedGroups.join(", ")} uchun
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        O&apos;tish: <strong className="text-white">{test.passingScore}%</strong>
                      </span>

                      {isAllowed ? (
                        <Link
                          href={`/exam/${test.accessCode}`}
                          className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                        >
                          <span>Boshlash</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span
                          className="py-2 px-3 rounded-xl bg-white/5 text-slate-500 text-xs font-semibold flex items-center gap-1 cursor-not-allowed"
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-cyan-400" />
            <span>Mening Test Natijalarim</span>
          </h2>

          {results.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl text-slate-400 text-xs border border-white/10">
              Siz hali hech qanday test topshirmadingiz. Yuqoridagi testlardan birini boshlang!
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A1024] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3.5">Test Nomi</th>
                      <th className="px-6 py-3.5">To&apos;g&apos;ri Javob</th>
                      <th className="px-6 py-3.5">Ball (%)</th>
                      <th className="px-6 py-3.5">Holat</th>
                      <th className="px-6 py-3.5">Sana</th>
                      <th className="px-6 py-3.5 text-right">Hisobot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          {r.test?.title || "Test"}
                        </td>
                        <td className="px-6 py-4">
                          {r.correctAnswers} / {r.totalQuestions}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-white">
                          {r.scorePercent}%
                        </td>
                        <td className="px-6 py-4">
                          {r.passed ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              O&apos;tdi
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              O&apos;tmadi
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/exam/result/${r.id}`}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Ko&apos;rish</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
