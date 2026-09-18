"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";

export default function QuickJoinForm() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;
    router.push(`/exam/${cleanCode}`);
  };

  return (
    <form
      onSubmit={handleJoin}
      className="glass-panel p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-2 border border-emerald-500/25 shadow-xl shadow-emerald-950/20"
    >
      <div className="flex items-center gap-3 px-3 w-full sm:w-auto flex-1">
        <KeyRound className="w-5 h-5 text-emerald-400 shrink-0" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Test kodini kiriting (masalan: algo-2026)..."
          className="w-full bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
      >
        <span>Testga kirish</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
