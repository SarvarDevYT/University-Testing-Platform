import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070D1E] pt-14 pb-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo & description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-wide">
                UNIVER <span className="text-cyan-400">TEST</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Oliy ta&apos;lim muassasalari, fakultetlar va o&apos;qituvchilar uchun yagona raqamli test,
              oraliq va yakuniy nazorat hamda psixodiagnostika platformasi.
              Yagona havola orqali 1000+ talabadan bir vaqtda xavfsiz test oling.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#1C2541] border border-white/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
              <span className="text-xs text-slate-400">Telegram qo&apos;llab-quvvatlash guruhi</span>
            </div>
          </div>

          {/* Havolalar */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Bo&apos;limlar
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#tests-catalog" className="hover:text-cyan-400 transition-colors">
                  Testlar katalogi
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                  Yo&apos;riqnoma va qo&apos;llanma
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-cyan-400 transition-colors">
                  Tizim imkoniyatlari
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cyan-400 transition-colors">
                  Kabinetga kirish
                </Link>
              </li>
            </ul>
          </div>

          {/* Bog'lanish */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Bog&apos;lanish
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Toshkent shahri, Universitet binosi</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+998 (71) 200-00-00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>admin@univer-test.uz</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pastki mualliflik huquqi */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 UNIVER TEST PLATFORM. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-6">
            <span>Foydalanuvchilar uchun bepul raqamli tizim</span>
            <span>Neon Serverless + Vercel Cloud</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
