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
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatDateTime } from "@/lib/format";

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPassed, setFilterPassed] = useState<string>("all"); // "all", "passed", "failed"

  const fetchResults = () => {
    fetch("/api/admin/results")
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setResults(data.results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
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
      const res = await fetch("/api/admin/results", { method: "DELETE" });
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

  // Excel (.xlsx) ga eksport qilish
  const exportToExcel = () => {
    if (filteredResults.length === 0) {
      alert("Eksport qilish uchun natijalar mavjud emas");
      return;
    }

    const exportData = filteredResults.map((r, index) => ({
      "№": index + 1,
      "Talaba F.I.SH": r.user?.fullName || r.guestName || "Noma'lum",
      "Guruh": r.user?.groupName || r.guestGroup || "Umumiy",
      "Fakultet": r.user?.faculty || "-",
      "Test Nomi": r.test?.title || "-",
      "Kategoriya": r.test?.category || "-",
      "To'g'ri Javoblar": `${r.correctAnswers} / ${r.totalQuestions}`,
      "To'plangan Ball (%)": `${r.scorePercent}%`,
      "Natija": r.passed ? "O'tdi" : "O'tmadi",
      "Sarflangan Vaqt (soniya)": `${r.timeSpentSeconds} sek`,
      "Topshirilgan Vaqt (Kun:Oy:Yil)": formatDateTime(r.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Natijalari");
    XLSX.writeFile(
      workbook,
      `Univer_Test_Natijalari_${new Date().toISOString().slice(0, 10)}.xlsx`
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

  return (
    <div className="space-y-6">
      {/* Sarlavha & Amallar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Natijalar & Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Talabalarning barcha topshirgan testlari, ballari va Excel hisoboti
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {results.length > 0 && (
            <button
              onClick={handleClearAllResults}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Natijalarni Tozalash</span>
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
                  <th className="px-6 py-4">To&apos;g&apos;ri Javoblar</th>
                  <th className="px-6 py-4">Foiz / Ball</th>
                  <th className="px-6 py-4">Holat</th>
                  <th className="px-6 py-4">Vaqt</th>
                  <th className="px-6 py-4">Sana</th>
                  <th className="px-6 py-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredResults.map((r) => {
                  const sName = r.user?.fullName || r.guestName || "Noma'lum";
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {sName}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono">
                        {r.user?.groupName || r.guestGroup || "-"}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        {r.test?.title || "Test"}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {r.correctAnswers} / {r.totalQuestions}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-white text-sm">
                          {r.scorePercent}%
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
                      <td className="px-6 py-4 text-slate-400">
                        {Math.floor(r.timeSpentSeconds / 60)} daq {r.timeSpentSeconds % 60} sek
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
  );
}
