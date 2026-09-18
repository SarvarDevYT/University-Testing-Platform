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
} from "lucide-react";
import { formatDate } from "@/lib/format";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
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
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (data.students) setStudents(data.students);
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
    if (!confirm(`Haqiqatan ham ${name} talabasini o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter
  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.username?.toLowerCase().includes(search.toLowerCase()) ||
      s.groupName?.toLowerCase().includes(search.toLowerCase()) ||
      s.faculty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sarlavha va Talaba Qo'shish */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Talabalar CRM Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Talabalarni ro&apos;yxatga olish, shaxsiy login va parol yaratish hamda test monitoringi
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setCreatedStudentInfo(null);
            generateRandomCredentials();
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Yangi Talaba Qo&apos;shish</span>
        </button>
      </div>

      {/* Qidiruv va Statistik qator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, login yoki guruh bo'yicha qidiruv..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-400 self-end sm:self-auto">
          Jami talabalar: <strong className="text-white">{filteredStudents.length} nafar</strong>
        </div>
      </div>

      {/* Talabalar Jadvali */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Talabalar ro&apos;yxati yuklanmoqda...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Talabalar topilmadi. &quot;Yangi Talaba Qo&apos;shish&quot; tugmasi orqali talaba qo&apos;shishingiz mumkin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A1024] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">F.I.SH (Talaba)</th>
                  <th className="px-6 py-4">Login</th>
                  <th className="px-6 py-4">Guruh / Fakultet</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">Testlar Soni</th>
                  <th className="px-6 py-4">Qo&apos;shilgan Sana</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {student.fullName}
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-0.5 rounded bg-black/40 text-cyan-400 border border-cyan-500/20 font-mono text-[11px]">
                        {student.username}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{student.groupName || "-"}</span>
                      {student.faculty && (
                        <span className="block text-[10px] text-slate-400">{student.faculty}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{student.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        {student._count?.results || 0} ta
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setResetModalStudent(student);
                          const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                          let pass = "";
                          for (let i = 0; i < 8; i++) {
                            pass += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setNewPassword(pass);
                        }}
                        title="Parolni yangilash"
                        className="p-1.5 rounded-lg bg-[#1C2541] hover:bg-[#253259] text-cyan-400 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(student.id, student.fullName)}
                        title="Talabani o'chirish"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* YANGI TALABA QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Yangi Talaba Qo&apos;shish</h3>
                <p className="text-xs text-slate-400">Talaba shaxsiy login va parolini yarating</p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Agar muvaffaqiyatli yaratilgan bo'lsa xabar va nusxalash */}
            {createdStudentInfo ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>Talaba muvaffaqiyatli qo&apos;shildi!</span>
                </div>
                <div className="space-y-1.5 text-xs bg-black/40 p-3 rounded-xl border border-white/10 font-mono">
                  <div>👤 Talaba: <strong className="text-white">{createdStudentInfo.fullName}</strong></div>
                  <div>🔑 Login: <strong className="text-cyan-400">{createdStudentInfo.username}</strong></div>
                  <div>🔒 Parol: <strong className="text-emerald-400">{createdStudentInfo.passwordPlain}</strong></div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyStudentCredentials(createdStudentInfo)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? "Nusxalandi!" : "Login-Parolni Nusxalash"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedStudentInfo(null);
                      generateRandomCredentials();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#1C2541] hover:bg-[#253259] text-white text-xs font-semibold"
                  >
                    Yana qo&apos;shish
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Talabaning To&apos;liq Ism-Familiyasi *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan: Karimov Sardor Anvar o'g'li"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Login (Tizimga kirish uchun) *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="talaba_123"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Parol *
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomCredentials}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Avto generatsiya</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={passwordPlain}
                      onChange={(e) => setPasswordPlain(e.target.value)}
                      placeholder="Parol..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Guruh (Guruhi)
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Masalan: AT-210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fakultet
                    </label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="Axborot texnologiyalari"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Telefon Raqami
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#1C2541] hover:bg-[#253259] text-xs font-semibold text-slate-300"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setResetModalStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-[#1C2541] text-xs font-semibold text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
