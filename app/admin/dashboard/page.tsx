"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileQuestion,
  FileCheck,
  TrendingUp,
  UserPlus,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";
import { formatDateTime } from "@/lib/format";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTests: 0,
    totalResults: 0,
    recentResults: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Sarlavha va Tezkor Tugmalar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Boshqaruv Paneli
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Universitet test tizimi, talabalar va natijalarining umumiy holati
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="px-4 py-2.5 rounded-xl bg-[#1A1F2C] hover:bg-[#232938] text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Talaba qo&apos;shish</span>
          </Link>

          <Link
            href="/admin/tests"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yangi test yaratish</span>
          </Link>
        </div>
      </div>

      {/* 4 ta Asosiy Ko'rsatkich Kartochkalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Talabalar */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Jami Talabalar</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : stats.totalStudents}
            </span>
            <span className="text-xs text-slate-400">nafar</span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>Login va paroli mavjud talabalar</span>
          </div>
        </div>

        {/* Testlar */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mavjud Testlar</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : stats.totalTests}
            </span>
            <span className="text-xs text-slate-400">ta</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            Savollar banki bilan faol
          </div>
        </div>

        {/* Topshirilgan testlar */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Topshirilgan Testlar</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : stats.totalResults}
            </span>
            <span className="text-xs text-slate-400">marta</span>
          </div>
          <div className="mt-3 text-[11px] text-amber-400 font-medium">
            Avtomatik baholangan
          </div>
        </div>

        {/* Platforma Holati */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Platforma Holati</span>
            <div className="w-10 h-10 rounded-xl bg-slate-700/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">100%</span>
            <span className="text-xs text-emerald-400 font-bold">Faol</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            Neon Serverless ulanish
          </div>
        </div>
      </div>

      {/* So'nggi Natijalar Monitoringi */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              So&apos;nggi Topshirilgan Testlar
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Talabalar tomonidan topshirilgan eng oxirgi test natijalari
            </p>
          </div>
          <Link
            href="/admin/results"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>Barchasini ko&apos;rish</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {stats.recentResults?.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            Hozircha hech qanday test topshirilmagan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0C12] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/5">
                <tr>
                  <th className="px-6 py-3.5">Talaba</th>
                  <th className="px-6 py-3.5">Guruh / Fakultet</th>
                  <th className="px-6 py-3.5">Test Nomi</th>
                  <th className="px-6 py-3.5">Ball / Foiz</th>
                  <th className="px-6 py-3.5">Holat</th>
                  <th className="px-6 py-3.5">Sana (Kun:Oy:Yil)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {stats.recentResults?.map((res: any) => (
                  <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {res.user?.fullName || res.guestName || "Noma'lum"}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {res.user?.groupName || res.guestGroup || "Umumiy"}
                    </td>
                    <td className="px-6 py-4">
                      {res.test?.title || "Test"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{res.scorePercent}%</span>{" "}
                      <span className="text-slate-400">
                        ({res.correctAnswers}/{res.totalQuestions})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {res.passed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          O&apos;tdi
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          O&apos;tmadi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {formatDateTime(res.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
