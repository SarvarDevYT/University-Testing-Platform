import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogIn,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#090B10] pt-16 pb-8 text-slate-400 text-sm overflow-hidden">
      {/* Orqa fon nafis zumrad nur effektlari */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[550px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-teal-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Yuqori Tezkor Chaqiruv Paneli (Call-to-Action Card) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 mb-14 bg-gradient-to-r from-[#141822]/90 via-[#101520]/80 to-[#141822]/90 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Universitet yoki kafedrangiz uchun test tizimini ishga tushiring
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Barcha talabalardan yagona havola yoki guruhlar kesimida tezkor va xavfsiz test oling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Kabinetga kirish</span>
            </Link>
          </div>
        </div>

        {/* Asosiy 4 ustunli tuzilma */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Logo va platforma maqsadi (5 ustun) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                  UNIVER <span className="text-emerald-400">TEST</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Raqamli Baholash Platformasi
                </div>
              </div>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Oliy ta&apos;lim muassasalari, fakultetlar va o&apos;qituvchilar uchun yagona raqamli test,
              oraliq nazorat va monitoring platformasi. 1000+ talabadan bir vaqtda xavfsiz va shaffof
              test olish imkoniyati.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141822] border border-white/10 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-950/30 text-xs font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Telegram orqali bog&apos;lanish</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </a>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Xavfsiz va Himoyalangan</span>
              </div>
            </div>
          </div>

          {/* Bo'limlar (2 ustun) */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Platforma</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#hero" className="hover:text-emerald-400 transition-colors">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="#tests-catalog" className="hover:text-emerald-400 transition-colors">
                  Testlar katalogi
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  Qanday ishlaydi?
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-emerald-400 transition-colors">
                  Tizim afzalliklari
                </Link>
              </li>
            </ul>
          </div>

          {/* Foydalanuvchilar (2 ustun) */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Kabinetlar</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Talaba kabineti
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Admin boshqaruv paneli
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Akademik guruhlar
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Test natijalari va tahlil
                </Link>
              </li>
            </ul>
          </div>

          {/* Bog'lanish (3 ustun) */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold mb-4 text-xs tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Qo&apos;llab-quvvatlash</span>
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">Toshkent shahri, Universitet bosh binosi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-mono">+998 (71) 200-00-00</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">admin@univer-test.uz</span>
              </li>
              <li className="pt-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Xavfsiz va shifrlangan tizim</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Pastki mualliflik huquqi va tizim holati */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 UNIVER TEST PLATFORM. Barcha huquqlar himoyalangan.</p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Tizim faol va barqaror</span>
            </div>

            <span className="text-slate-400 text-[11px]">
              Oliy ta&apos;lim muassasalari uchun yagona raqamli tizim
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
