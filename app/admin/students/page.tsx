"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  X,
  GraduationCap,
  Upload,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatDate } from "@/lib/format";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Yangi talaba modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [passwordPlain, setPasswordPlain] = useState("");
  const [faculty, setFaculty] = useState("");
  const [groupName, setGroupName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Ommaviy Excel import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccessResult, setImportSuccessResult] = useState<any | null>(null);

  // Yaratilgan talaba ma'lumotlarini nusxalash xabari
  const [createdStudentInfo, setCreatedStudentInfo] = useState<{
    fullName: string;
    username: string;
    passwordPlain: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Parolni yangilash modal
  const [resetModalStudent, setResetModalStudent] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      const [studentsRes, groupsRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/groups"),
      ]);
      const data = await studentsRes.json();
      const groupsData = await groupsRes.json();
      if (data.students) setStudents(data.students);
      if (groupsData.groups) setGroups(groupsData.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Tasodifiy login va parol generatsiya qilish
  const generateRandomCredentials = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setUsername(`talaba_${randomNum}`);
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordPlain(pass);
  };

  // Yangi talaba yaratish
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username,
          passwordPlain,
          faculty,
          groupName,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      // Yaratilgan talaba info ko'rsatish
      setCreatedStudentInfo({
        fullName,
        username,
        passwordPlain,
      });

      // Tozalash va yangilash
      setFullName("");
      setUsername("");
      setPasswordPlain("");
      setFaculty("");
      setGroupName("");
      setPhone("");
      fetchStudents();
    } catch (err: any) {
      setModalError(err.message || "Talabani qo'shib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  };

  // Excel shablonini yuklab olish
  const downloadTemplate = () => {
    const templateData = [
      {
        "F.I.SH": "Aliyev Jasur Anvar o'g'li",
        "Guruh": "AT-21",
        "Fakultet": "Axborot Texnologiyalari",
        "Telefon": "+998 90 123 45 67",
      },
      {
        "F.I.SH": "Karimova Madina Akram qizi",
        "Guruh": "AT-21",
        "Fakultet": "Axborot Texnologiyalari",
        "Telefon": "+998 93 321 00 11",
      },
      {
        "F.I.SH": "Toshpo'latov Sardor Rustamovich",
        "Guruh": "DI-19",
        "Fakultet": "Dasturiy Injiniring",
        "Telefon": "+998 97 777 88 99",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Talabalar");
    XLSX.writeFile(wb, "Talabalar_Yuklash_Shabloni.xlsx");
  };

  // Excel faylini tanlash va o'qish
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          setImportError("Faylda hech qanday ma'lumot topilmadi");
          return;
        }

        // Ustunlarni moslashtirish (F.I.SH, FISH, FIO, Ism, Guruh, Fakultet, Telefon)
        const parsed = rawData
          .map((row) => {
            const fName =
              row["F.I.SH"] ||
              row["FISH"] ||
              row["FIO"] ||
              row["F.I.O"] ||
              row["Ism Familiya"] ||
              row["Full Name"] ||
              row["F.I.Sh"] ||
              row["Talaba"];

            const grp = row["Guruh"] || row["Group"] || row["Guruh nomi"] || "";
            const fac = row["Fakultet"] || row["Faculty"] || "";
            const ph = row["Telefon"] || row["Phone"] || row["Tel"] || "";

            return {
              fullName: String(fName || "").trim(),
              groupName: String(grp || "").trim(),
              faculty: String(fac || "").trim(),
              phone: String(ph || "").trim(),
            };
          })
          .filter((item) => item.fullName.length > 2);

        if (parsed.length === 0) {
          setImportError("Faylda 'F.I.SH' ustuni topilmadi yoki barcha qatorlar bo'sh!");
          return;
        }

        setParsedStudents(parsed);
      } catch (err: any) {
        setImportError("Faylni o'qishda xatolik: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Ommaviy importni serverga yuborish va tayyor login-parol Excelini chiqarish
  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) return;
    setImporting(true);
    setImportError("");

    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: parsedStudents }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ommaviy yuklashda xatolik");

      // Yaratilgan talabalarni parollari bilan Excel qilib avtomatik yuklab berish!
      const exportData = data.students.map((s: any, idx: number) => ({
        "№": idx + 1,
        "Talaba F.I.SH": s.fullName,
        "Guruh": s.groupName || "-",
        "Fakultet": s.faculty || "-",
        "Tizim Logini": s.username,
        "Maxfiy Parol": s.passwordPlain,
        "Telefon": s.phone || "-",
        "Saytga Kirish": `${window.location.origin}/login`,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Talabalar Parollari");
      XLSX.writeFile(
        wb,
        `Talabalar_Login_Parollari_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      setImportSuccessResult({
        count: data.count,
        fileName: `Talabalar_Login_Parollari_${new Date().toISOString().slice(0, 10)}.xlsx`,
      });

      fetchStudents();
    } catch (err: any) {
      setImportError(err.message || "Xatolik yuz berdi");
    } finally {
      setImporting(false);
    }
  };

  // Talaba ma'lumotlarini nusxalash
  const copyStudentCredentials = (info: { fullName: string; username: string; passwordPlain: string }) => {
    const text = `Universitet Test Tizimi Kirish Ma'lumotlari:\n👤 Talaba: ${info.fullName}\n🔑 Login: ${info.username}\n🔒 Parol: ${info.passwordPlain}\n🌐 Sayt: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Parolni yangilash
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent || !newPassword) return;
    setResetSubmitting(true);

    try {
      const res = await fetch("/api/admin/students/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: resetModalStudent.id,
          newPassword,
        }),
      });

      if (!res.ok) throw new Error("Parolni yangilab bo'lmadi");

      alert(`Parol muvaffaqiyatli yangilandi! Yangi parol: ${newPassword}`);
      setResetModalStudent(null);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  // Talabani o'chirish
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Haqiqatan ham ${name} talabasini bazadan to'liq o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Talabani o'chirishda xatolik");
      }
    } catch (err) {
      console.error(err);
      alert("Aloqa xatoligi yuz berdi");
    }
  };

  // Filter
  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.fullName?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      s.groupName?.toLowerCase().includes(q) ||
      s.faculty?.toLowerCase().includes(q);

    const matchGroup =
      selectedGroupFilter === "ALL" ||
      (selectedGroupFilter === "NO_GROUP" && !s.groupName) ||
      s.groupName?.toLowerCase() === selectedGroupFilter.toLowerCase();

    return matchSearch && matchGroup;
  });

  return (
    <div className="space-y-6">
      {/* Sarlavha va Tugmalar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Talabalar CRM Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Talabalarni ro&apos;yxatga olish, ommaviy Excel yuklash va login-parollar generatori
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Ommaviy Excel yuklash tugmasi */}
          <button
            onClick={() => {
              setIsImportModalOpen(true);
              setImportFile(null);
              setParsedStudents([]);
              setImportError("");
              setImportSuccessResult(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#141822] hover:bg-[#1C2230] border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel Ommaviy Yuklash</span>
          </button>

          {/* Bittalab talaba qo'shish tugmasi */}
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setCreatedStudentInfo(null);
              generateRandomCredentials();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi Talaba Qo&apos;shish</span>
          </button>
        </div>
      </div>

      {/* Qidiruv va Guruh Filteri */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-xl">
          <div className="relative w-full sm:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, login yoki guruh bo'yicha qidiruv..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Barcha guruhlar ({students.length})</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name} guruhi
              </option>
            ))}
            <option value="NO_GROUP">Guruhsiz talabalar</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 self-end sm:self-auto">
          Ko&apos;rsatildi: <span className="text-white font-bold">{filteredStudents.length}</span> ta
        </div>
      </div>

      {/* Talabalar Jadvali */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Talabalar yuklanmoqda...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Hech qanday talaba topilmadi. Yuqoridagi tugmalar orqali bittalab yoki Excel orqali ommaviy qo&apos;shing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A1024] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">F.I.SH (Talaba)</th>
                  <th className="px-6 py-4">Login (Tizim ID)</th>
                  <th className="px-6 py-4">Guruh</th>
                  <th className="px-6 py-4">Fakultet</th>
                  <th className="px-6 py-4">Topshirgan Testlari</th>
                  <th className="px-6 py-4">Qo&apos;shilgan Sana</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {s.fullName?.charAt(0) || "T"}
                      </div>
                      <div>
                        <div>{s.fullName}</div>
                        {s.phone && <div className="text-[10px] text-slate-400">{s.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-[#141822] text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        {s.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">
                      {s.groupName || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {s.faculty || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-white">
                        {s._count?.results || 0} ta test
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setResetModalStudent(s);
                          setNewPassword("");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Parolni yangilash"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(s.id, s.fullName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Talabani bazadan o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OMMAVIY EXCEL YUKLASH MODALI */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl relative my-8">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Excel orqali talabalarni ommaviy yuklash
                </h3>
                <p className="text-xs text-slate-400">
                  Guruh yoki dekanat ro&apos;yxatini (.xlsx) yuklang va avtomatik login/parol oling
                </p>
              </div>
            </div>

            {importSuccessResult ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {importSuccessResult.count} ta talaba muvaffaqiyatli kiritildi!
                  </h4>
                  <p className="text-xs text-emerald-300 mt-1">
                    Barcha talabalarning shaxsiy login va parollari yozilgan Excel fayl avtomatik yuklab olindi.
                  </p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Shablonni yuklab olish paneli */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Namuna shablon mavjud</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ustunlar: F.I.SH, Guruh, Fakultet, Telefon
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Shablonni Yuklab Olish (.xlsx)</span>
                  </button>
                </div>

                {/* Fayl yuklash zonasi */}
                <div className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-all">
                  <input
                    type="file"
                    id="excel-file-input"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="excel-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-xs font-bold text-white">
                      {importFile ? importFile.name : "Excel faylni tanlang yoki shu yerga tashlang"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      .xlsx yoki .xls formatidagi fayllar qabul qilinadi
                    </div>
                  </label>
                </div>

                {importError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Oldindan ko'rish (Preview) */}
                {parsedStudents.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        Fayldan aniqlangan talabalar ({parsedStudents.length} ta):
                      </span>
                      <span className="text-[11px] text-emerald-400">
                        Har biriga avtomatik login va 8-xonali parol beriladi
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#0A0D14]">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-white/5 text-slate-400 sticky top-0 font-semibold border-b border-white/10">
                          <tr>
                            <th className="px-3 py-2">№</th>
                            <th className="px-3 py-2">F.I.SH</th>
                            <th className="px-3 py-2">Guruh</th>
                            <th className="px-3 py-2">Fakultet</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {parsedStudents.slice(0, 50).map((s, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-1.5 font-mono text-slate-500">{idx + 1}</td>
                              <td className="px-3 py-1.5 font-semibold text-white">{s.fullName}</td>
                              <td className="px-3 py-1.5 font-mono text-emerald-400">{s.groupName || "-"}</td>
                              <td className="px-3 py-1.5 text-slate-400">{s.faculty || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedStudents.length > 50 && (
                      <p className="text-[10px] text-slate-400 text-center">
                        ...va yana {parsedStudents.length - 50} ta talaba
                      </p>
                    )}
                  </div>
                )}

                {/* Tugmalar */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    disabled={parsedStudents.length === 0 || importing}
                    onClick={handleExecuteImport}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Bazaga kiritilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Bazaga yuklash va Parollar faylini olish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BITTA-BITTALAB TALABA QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yangi Talabani Ro&apos;yxatga Olish</h3>
                <p className="text-xs text-slate-400">Shaxsiy login va xavfsiz parol bilan biriktirish</p>
              </div>
            </div>

            {createdStudentInfo ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Talaba muvaffaqiyatli ro&apos;yxatga olindi!</span>
                  </div>
                  <p>Ushbu kirish ma&apos;lumotlarini nusxalab olib, talabaga taqdim eting:</p>
                  <div className="bg-black/40 p-3 rounded-xl font-mono text-white text-xs space-y-1">
                    <div>Talaba: <span className="text-slate-300">{createdStudentInfo.fullName}</span></div>
                    <div>Login: <span className="text-emerald-400 font-bold">{createdStudentInfo.username}</span></div>
                    <div>Parol: <span className="text-amber-400 font-bold">{createdStudentInfo.passwordPlain}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyStudentCredentials(createdStudentInfo)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? "Nusxalandi!" : "Ma'lumotlarni Nusxalash"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCreatedStudentInfo(null);
                      generateRandomCredentials();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
                  >
                    Yana qo&apos;shish
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateStudent} className="space-y-4">
                {modalError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Talaba F.I.SH *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan: Aliyev Jasur Anvar o'g'li"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Guruh nomi
                    </label>
                    <input
                      type="text"
                      list="existing-groups-list"
                      value={groupName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGroupName(val);
                        const matched = groups.find((g: any) => g.name.toLowerCase() === val.trim().toLowerCase());
                        if (matched && matched.faculty && !faculty) {
                          setFaculty(matched.faculty);
                        }
                      }}
                      placeholder="Masalan: AT-21"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <datalist id="existing-groups-list">
                      {groups.map((g: any) => (
                        <option key={g.id} value={g.name}>
                          {g.name} {g.faculty ? `(${g.faculty})` : ""}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fakultet
                    </label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="Masalan: Axborot texnologiyalari"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telefon raqami
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">
                      Kirish Ma&apos;lumotlari (Avtomatik yoki qo&apos;lda)
                    </span>
                    <button
                      type="button"
                      onClick={generateRandomCredentials}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Qayta generatsiya</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Login (Username)</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Parol (8 xonali)</label>
                      <input
                        type="text"
                        value={passwordPlain}
                        onChange={(e) => setPasswordPlain(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-amber-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Saqlash va Yaratish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PAROLNI YANGILASH (RESET PASSWORD) MODALI */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setResetModalStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Parolni Yangilash</h3>
                <p className="text-xs text-slate-400">{resetModalStudent.fullName}</p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yangi Parol
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yangi parolni kiriting..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-semibold text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resetSubmitting ? "Saqlanmoqda..." : "Parolni yangilash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
