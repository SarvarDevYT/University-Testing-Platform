"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, LogIn, Lock, User, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kirishda xatolik yuz berdi");
      }

      // Roliga qarab yo'naltirish
      if (data.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  // Demo hisob bilan tez to'ldirish
  const fillDemo = (role: "admin" | "student") => {
    if (role === "admin") {
      setUsername("adminuniver");
      setPassword("universityadminuz");
    } else {
      setUsername("talaba2026");
      setPassword("admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4 py-12 relative overflow-hidden">
      {/* Orqa fon nur effekti */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full">
        {/* Ortga qaytish */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </Link>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          {/* Logo va sarlavha */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30 mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Tizimga Kirish
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Admin yoki talaba shaxsiy kabinetiga kirish
            </p>
          </div>

          {/* Xatolik xabari */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Forma */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Login (Foydalanuvchi nomi)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Loginni kiriting (masalan: admin yoki talaba)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Kirish</span>
                </>
              )}
            </button>
          </form>

          {/* Demo hisoblar tezkor tugmalari */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tezkor sinab ko&apos;rish uchun (Demo)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="px-3 py-2 rounded-lg bg-[#1C2541] hover:bg-[#253259] border border-white/10 text-xs text-indigo-300 font-medium transition-all text-center"
              >
                👑 Admin (adminuniver)
              </button>
              <button
                type="button"
                onClick={() => fillDemo("student")}
                className="px-3 py-2 rounded-lg bg-[#1C2541] hover:bg-[#253259] border border-white/10 text-xs text-cyan-300 font-medium transition-all text-center"
              >
                🎓 Talaba (talaba2026)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-3">
              (Boshlang&apos;ich demo parol: <strong className="text-slate-400">admin123</strong>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
