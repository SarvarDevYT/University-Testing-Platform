"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GraduationCap, LogIn, Menu, X, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0C0E14]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
                UNIVER <span className="text-emerald-400">TEST</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">
                Raqamli Baholash Platformasi
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#hero" className="hover:text-emerald-400 transition-colors">
              Bosh sahifa
            </Link>
            <Link href="#tests-catalog" className="hover:text-emerald-400 transition-colors">
              Testlar katalogi
            </Link>
            <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              Qanday ishlaydi?
            </Link>
            <Link href="#features" className="hover:text-emerald-400 transition-colors">
              Afzalliklar
            </Link>
          </div>

          {/* Action Buttons */}
          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{user.role === "ADMIN" ? "Admin CRM" : "Shaxsiy Kabinet"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Kabinetga kirish</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-xl bg-[#141822] border border-white/10 space-y-3">
            <Link
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 text-sm"
            >
              Bosh sahifa
            </Link>
            <Link
              href="#tests-catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 text-sm"
            >
              Testlar katalogi
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 text-sm"
            >
              Qanday ishlaydi?
            </Link>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard") : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-white bg-emerald-600 rounded-lg"
              >
                {user ? (user.role === "ADMIN" ? "Admin CRM" : "Shaxsiy Kabinet") : "Kabinetga kirish"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
