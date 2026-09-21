"use client";

import { useEffect, useState } from "react";
import {
  FileCheck,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Award,
  Trash2,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  Printer,
  Users,
  Sparkles,
  Layers,
  GraduationCap,
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatDateTime } from "@/lib/format";

function getAcademicGrade(percent: number) {
  if (percent >= 86) return { grade: 5, label: "A'lo (5)", color: "text-emerald-400" };
  if (percent >= 71) return { grade: 4, label: "Yaxshi (4)", color: "text-teal-400" };
  if (percent >= 55) return { grade: 3, label: "Qoniqarli (3)", color: "text-amber-400" };
  return { grade: 2, label: "Qoniqarsiz (2)", color: "text-rose-400" };
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab: "results" | "analytics" | "vedomost"
  const [activeTab, setActiveTab] = useState<"results" | "analytics" | "vedomost">("results");

  // Natijalar filterlari
  const [search, setSearch] = useState("");
  const [filterPassed, setFilterPassed] = useState<string>("all");

  // Vedomost tanlovlari
  const [selectedVedomostGroup, setSelectedVedomostGroup] = useState<string>("");
  const [selectedVedomostTest, setSelectedVedomostTest] = useState<string>("");

  const fetchData = async () => {
    try {
      const [resData, groupsData, testsData] = await Promise.all([
        fetch("/api/admin/results").then((r) => r.json()),
        fetch("/api/admin/groups").then((r) => r.json()),
        fetch("/api/admin/tests").then((r) => r.json()),
      ]);

      if (resData.results) setResults(resData.results);
      if (groupsData.groups) {
        setGroups(groupsData.groups);
        if (groupsData.groups.length > 0) {
          setSelectedVedomostGroup(groupsData.groups[0].name);
        }
      }
      if (testsData.tests) {
        setTests(testsData.tests);
        if (testsData.tests.length > 0) {
          setSelectedVedomostTest(testsData.tests[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Natijani bazadan to'g'ridan to'g'ri o'chirish
  const handleDeleteResult = async (id: string, studentName: string) => {
    if (!confirm(`Haqiqatan ham "${studentName}" ning ushbu natijasini bazadan butunlay o'chirmoqchimisiz?`)) return;

    try {
      const res = await fetch(`/api/admin/results/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResults((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Natijani o'chirishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Aloqa xatoligi yuz berdi");
    }
  };

  // Barcha natijalarni bazadan tozalash
  const handleClearAllResults = async () => {
    if (!confirm("DIQQAT! Bazadagi BARCHA test topshirish natijalarini to'liq o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!")) return;

    try {
      const res = await fetch(`/api/admin/results`, { method: "DELETE" });
      if (res.ok) {
        setResults([]);
        alert("Barcha natijalar bazadan muvaffaqiyatli tozalandi!");
      } else {
        const data = await res.json();
        alert(data.error || "Natijalarni tozalashda xatolik");
      }
    } catch (err) {
      console.error(err);
      alert("Aloqa xatoligi yuz berdi");
    }
  };

  // Umumiy Excel (.xlsx) ga eksport qilish
  const exportToExcel = () => {
    if (filteredResults.length === 0) {
      alert("Eksport qilish uchun natijalar mavjud emas");
      return;
    }

    const exportData = filteredResults.map((r, index) => {
      const gradeInfo = getAcademicGrade(r.scorePercent);
      return {
        "№": index + 1,
        "Talaba F.I.SH": r.user?.fullName || r.guestName || "Noma'lum",
        "Guruh": r.user?.groupName || r.guestGroup || "Umumiy",
        "Fakultet": r.user?.faculty || "-",
        "Test Nomi": r.test?.title || "-",
        "Kategoriya": r.test?.category || "-",
        "To'g'ri Javoblar": `${r.correctAnswers} / ${r.totalQuestions}`,
        "To'plangan Ball (%)": `${r.scorePercent}%`,
        "Akademik Baho": gradeInfo.label,
        "Natija": r.passed ? "O'tdi" : "O'tmadi",
        "Sarflangan Vaqt": `${Math.floor(r.timeSpentSeconds / 60)} daq ${r.timeSpentSeconds % 60} sek`,
        "Topshirilgan Vaqt": formatDateTime(r.createdAt),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Natijalar");
    XLSX.writeFile(
      workbook,
      `Univer_Test_Natijalari_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // RASMIY VEDOMOST EXPORTI (.XLSX)
  const exportOfficialVedomostExcel = () => {
    if (vedomostFilteredResults.length === 0) {
      alert("Tanlangan guruh va test bo'yicha natijalar mavjud emas");
      return;
    }

    const currentTest = tests.find((t) => t.id === selectedVedomostTest);
    const testTitle = currentTest?.title || "Test";
    const groupName = selectedVedomostGroup || "Barcha guruhlar";

    const vedomostData = vedomostFilteredResults.map((r, index) => {
      const gradeInfo = getAcademicGrade(r.scorePercent);
      return {
        "№": index + 1,
        "Talaba F.I.SH": r.user?.fullName || r.guestName || "Noma'lum",
        "Akademik Guruh": r.user?.groupName || r.guestGroup || groupName,
        "Fan Nomi": testTitle,
        "Jami Savollar": r.totalQuestions,
        "To'g'ri Javoblar": r.correctAnswers,
        "To'plangan Ball (%)": `${r.scorePercent}%`,
        "Akademik Baho": gradeInfo.label,
        "Holat": r.passed ? "O'tdi" : "O'tmadi",
        "Talaba Imzosi": "_________________",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(vedomostData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vedomost");
    XLSX.writeFile(
      workbook,
      `Rasmiy_Vedomost_${groupName}_${testTitle.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`
    );
  };

  const filteredResults = results.filter((r) => {
    const studentName = (r.user?.fullName || r.guestName || "").toLowerCase();
    const groupName = (r.user?.groupName || r.guestGroup || "").toLowerCase();
    const testTitle = (r.test?.title || "").toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      studentName.includes(query) || groupName.includes(query) || testTitle.includes(query);

    if (filterPassed === "passed") return matchesSearch && r.passed;
    if (filterPassed === "failed") return matchesSearch && !r.passed;
    return matchesSearch;
  });

  // Vedomost uchun natijalarni filtrlash
  const vedomostFilteredResults = results.filter((r) => {
    const matchesGroup =
      !selectedVedomostGroup ||
      (r.user?.groupName || r.guestGroup || "").trim().toLowerCase() === selectedVedomostGroup.trim().toLowerCase();
    const matchesTest =
      !selectedVedomostTest || r.testId === selectedVedomostTest;
    return matchesGroup && matchesTest;
  });

  // GURUHLAR REYTINGI & ANALITIKA HISOBLASH
  const groupStatsMap: Record<
    string,
    { name: string; totalStudents: number; totalScore: number; passedCount: number }
  > = {};

  results.forEach((r) => {
    const gName = (r.user?.groupName || r.guestGroup || "Biriktirilmagan").trim();
    if (!groupStatsMap[gName]) {
      groupStatsMap[gName] = { name: gName, totalStudents: 0, totalScore: 0, passedCount: 0 };
    }
    groupStatsMap[gName].totalStudents += 1;
    groupStatsMap[gName].totalScore += r.scorePercent || 0;
    if (r.passed) groupStatsMap[gName].passedCount += 1;
  });

  const groupRankings = Object.values(groupStatsMap)
    .map((g) => ({
      ...g,
      avgScore: g.totalStudents > 0 ? Math.round(g.totalScore / g.totalStudents) : 0,
      passRate: g.totalStudents > 0 ? Math.round((g.passedCount / g.totalStudents) * 100) : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const overallTotal = results.length;
  const overallPassed = results.filter((r) => r.passed).length;
  const overallAvg =
    overallTotal > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.scorePercent || 0), 0) / overallTotal)
      : 0;

  return (
    <div className="space-y-6">
      {/* Sarlavha & Amallar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Natijalar & Analitika
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Guruhlar reytingi, rasmiy akademik vedomost va Excel hisoboti
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {results.length > 0 && (
            <button
              onClick={handleClearAllResults}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Tozalash</span>
            </button>
          )}

          <button
            onClick={exportToExcel}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel (.xlsx) Yuklab Olish</span>
          </button>
        </div>
      </div>

      {/* TABS (Jadval / Reyting / Rasmiy Vedomost) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "results"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-[#141822] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Barcha Natijalar ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "analytics"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-[#141822] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Guruhlar Reytingi & Analitika</span>
        </button>

        <button
          onClick={() => setActiveTab("vedomost")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "vedomost"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-[#141822] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Rasmiy Vedomost (Qaydnoma)</span>
        </button>
      </div>

      {/* 1. BARCHA NATIJALAR TABI */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {/* Qidiruv va Filterlar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Talaba, guruh yoki test bo'yicha qidiruv..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setFilterPassed("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterPassed === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1C2541] text-slate-400 hover:text-white"
                }`}
              >
                Barchasi ({results.length})
              </button>
              <button
                onClick={() => setFilterPassed("passed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterPassed === "passed"
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1C2541] text-slate-400 hover:text-white"
                }`}
              >
                O&apos;tganlar
              </button>
              <button
                onClick={() => setFilterPassed("failed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterPassed === "failed"
                    ? "bg-rose-600 text-white"
                    : "bg-[#1C2541] text-slate-400 hover:text-white"
                }`}
              >
                O&apos;tolmaganlar
              </button>
            </div>
          </div>

          {/* Natijalar Jadvali */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Natijalar yuklanmoqda...
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Hech qanday natija topilmadi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A1024] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Talaba (F.I.SH)</th>
                      <th className="px-6 py-4">Guruh</th>
                      <th className="px-6 py-4">Test Nomi</th>
                      <th className="px-6 py-4">To&apos;g&apos;ri</th>
                      <th className="px-6 py-4">Ball (%)</th>
                      <th className="px-6 py-4">Baho</th>
                      <th className="px-6 py-4">Holat</th>
                      <th className="px-6 py-4">Sana</th>
                      <th className="px-6 py-4 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredResults.map((r) => {
                      const sName = r.user?.fullName || r.guestName || "Noma'lum";
                      const grade = getAcademicGrade(r.scorePercent);
                      return (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{sName}</td>
                          <td className="px-6 py-4 text-slate-300 font-mono">
                            {r.user?.groupName || r.guestGroup || "-"}
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate">{r.test?.title || "Test"}</td>
                          <td className="px-6 py-4 font-medium">
                            {r.correctAnswers} / {r.totalQuestions}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-white text-sm">{r.scorePercent}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-extrabold text-xs ${grade.color}`}>
                              {grade.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {r.passed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>O&apos;tdi</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                <XCircle className="w-3 h-3" />
                                <span>O&apos;tmadi</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono">
                            {formatDateTime(r.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteResult(r.id, sName)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Natijani bazadan o'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GURUHLAR REYTINGI & ANALITIKA TABI */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Umumiy statistika kartochkalari */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="text-xs font-semibold text-slate-400 mb-1">Jami Topsherilgan Sinovlar</div>
              <div className="text-3xl font-extrabold text-white">{overallTotal} ta</div>
              <div className="text-[11px] text-emerald-400 mt-2">
                Barcha akademik guruhlar bo&apos;yicha
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="text-xs font-semibold text-slate-400 mb-1">O&apos;rtacha Universitet Bali</div>
              <div className="text-3xl font-extrabold text-teal-300">{overallAvg}%</div>
              <div className="text-[11px] text-slate-400 mt-2">
                Muvaffaqiyat ko&apos;rsatkichi
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="text-xs font-semibold text-slate-400 mb-1">Umumiy O&apos;tish Foizi</div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {overallTotal > 0 ? Math.round((overallPassed / overallTotal) * 100) : 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {overallPassed} nafar talaba ijobiy baholandi
              </div>
            </div>
          </div>

          {/* Guruhlar Reytingi Jadvali */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Akademik Guruhlar Reytingi</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">O&apos;rtacha ball bo&apos;yicha saralangan</span>
            </div>

            {groupRankings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Guruhlar bo&apos;yicha natijalar hali mavjud emas.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A1024] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">O&apos;rin</th>
                      <th className="px-6 py-4">Guruh Nomi</th>
                      <th className="px-6 py-4">Topshirganlar Soni</th>
                      <th className="px-6 py-4">O&apos;rtacha Ball (%)</th>
                      <th className="px-6 py-4">O&apos;tish Foizi</th>
                      <th className="px-6 py-4">Ko&apos;rsatkich</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {groupRankings.map((grp, idx) => {
                      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}-o'rin`;
                      return (
                        <tr key={grp.name} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-extrabold text-sm text-white">
                            {medal}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-400 font-mono text-sm">
                            {grp.name}
                          </td>
                          <td className="px-6 py-4">{grp.totalStudents} ta talaba</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-black text-white">{grp.avgScore}%</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-teal-300">{grp.passRate}%</td>
                          <td className="px-6 py-4">
                            <div className="w-32 h-2 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                style={{ width: `${grp.avgScore}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. RASMIY VEDOMOST (QAYDNOMA) TABI */}
      {activeTab === "vedomost" && (
        <div className="space-y-6">
          {/* Vedomost Filtrlash Boshqaruvi */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Akademik Guruhni Tanlang:
                  </label>
                  <select
                    value={selectedVedomostGroup}
                    onChange={(e) => setSelectedVedomostGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Barcha Guruhlar</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} {g.faculty ? `(${g.faculty})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fan / Testni Tanlang:
                  </label>
                  <select
                    value={selectedVedomostTest}
                    onChange={(e) => setSelectedVedomostTest(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Barcha Fanlar</option>
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start lg:self-auto">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-[#1C2541] hover:bg-[#253259] text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Vedomostni Chop Etish (PDF)</span>
                </button>

                <button
                  onClick={exportOfficialVedomostExcel}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Vedomostni Yuklab Olish (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>

          {/* CHOP ETILADIGAN RASMIY VEDOMOST BLOKI */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/15 shadow-2xl bg-[#0A0E17] print:bg-white print:text-black print:p-0">
            {/* Rasmiy Sarlavha */}
            <div className="text-center border-b border-white/10 pb-6 mb-6">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>O&apos;ZBEKISTON RESPUBLIKASI OLIY TA&apos;LIM VAZIRLIGI</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                TEST SINOVLARI NATIJALARI QAYDNOMASI (VEDOMOST)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 text-xs text-slate-300 font-mono">
                <div>
                  Fan: <strong className="text-white">{tests.find((t) => t.id === selectedVedomostTest)?.title || "Barcha fanlar"}</strong>
                </div>
                <div>
                  Guruh: <strong className="text-emerald-400">{selectedVedomostGroup || "Barcha guruhlar"}</strong>
                </div>
                <div>
                  Sana: <strong className="text-white">{new Date().toLocaleDateString("uz-UZ")}</strong>
                </div>
              </div>
            </div>

            {/* Jadval */}
            {vedomostFilteredResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Ushbu guruh yoki fan bo&apos;yicha test topshirgan talabalar topilmadi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-white/10 print:border-black">
                  <thead className="bg-[#141822] text-slate-300 uppercase tracking-wider text-[10px] font-bold border-b border-white/10 print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="px-4 py-3 border-r border-white/10">№</th>
                      <th className="px-4 py-3 border-r border-white/10">Talaba (F.I.SH)</th>
                      <th className="px-4 py-3 border-r border-white/10">Guruh</th>
                      <th className="px-4 py-3 border-r border-white/10 text-center">Savollar</th>
                      <th className="px-4 py-3 border-r border-white/10 text-center">To&apos;g&apos;ri</th>
                      <th className="px-4 py-3 border-r border-white/10 text-center">Ball (%)</th>
                      <th className="px-4 py-3 border-r border-white/10 text-center">Baho</th>
                      <th className="px-4 py-3 border-r border-white/10 text-center">Natija</th>
                      <th className="px-4 py-3 text-center">Imzo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-300 print:text-black">
                    {vedomostFilteredResults.map((r, idx) => {
                      const sName = r.user?.fullName || r.guestName || "Noma'lum";
                      const grade = getAcademicGrade(r.scorePercent);
                      return (
                        <tr key={r.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 border-r border-white/10 font-bold">{idx + 1}</td>
                          <td className="px-4 py-3 border-r border-white/10 font-semibold text-white print:text-black">
                            {sName}
                          </td>
                          <td className="px-4 py-3 border-r border-white/10 font-mono">
                            {r.user?.groupName || r.guestGroup || "-"}
                          </td>
                          <td className="px-4 py-3 border-r border-white/10 text-center">{r.totalQuestions}</td>
                          <td className="px-4 py-3 border-r border-white/10 text-center font-bold text-emerald-400 print:text-black">
                            {r.correctAnswers}
                          </td>
                          <td className="px-4 py-3 border-r border-white/10 text-center font-extrabold text-white print:text-black">
                            {r.scorePercent}%
                          </td>
                          <td className="px-4 py-3 border-r border-white/10 text-center font-bold">
                            <span className={grade.color}>{grade.label}</span>
                          </td>
                          <td className="px-4 py-3 border-r border-white/10 text-center">
                            <span className={r.passed ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {r.passed ? "O'tdi" : "O'tmadi"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500 font-mono">
                            _________________
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Vedomost Tagidagi Mas'ul Imzolari */}
                <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-300 print:text-black">
                  <div>
                    <div className="font-semibold text-white mb-2">Mas&apos;ul O&apos;qituvchi:</div>
                    <div className="flex items-center justify-between border-b border-white/20 pb-1">
                      <span>F.I.SH: _______________________</span>
                      <span>Imzo: ____________</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-2">Kafedra Mudiri:</div>
                    <div className="flex items-center justify-between border-b border-white/20 pb-1">
                      <span>F.I.SH: _______________________</span>
                      <span>Imzo: ____________</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
