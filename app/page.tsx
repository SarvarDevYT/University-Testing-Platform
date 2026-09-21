import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { dbService } from "@/lib/db-service";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  Users,
  ShieldCheck,
  Award,
  ArrowRight,
  Brain,
  GraduationCap,
  Sparkles,
  QrCode,
  Zap,
  LogIn,
} from "lucide-react";
import QuickJoinForm from "@/components/QuickJoinForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tests = await dbService.getTests(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0E14]">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* HERO SECTION */}
        <section id="hero" className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-32">
          {/* Orqa fon nur effekti (Zumrad va Qahrabo) */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Universitet uchun 100% Bepul va Ommaviy Test Tizimi</span>
            </div>

            {/* Sarlavha */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-[1.15]">
              Yagona havola orqali{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                1000+ talabadan
              </span>{" "}
              bir vaqtda test oling
            </h1>

            {/* Tavsif */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Oliy ta&apos;lim muassasalari, fakultetlar va o&apos;qituvchilar uchun mo&apos;ljallangan zamonaviy
              imtihon, oraliq nazorat va diagnostika platformasi. Yuqori yuklamalarda qotmaydi, natijalarni
              avtomatik tahlil qiladi.
            </p>

            {/* Tugmalar */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#tests-catalog"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Testlar katalogi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-[#161B26] hover:bg-[#1F2636] hover:text-white border border-white/10 hover:border-emerald-500/40 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Kabinetga kirish</span>
              </Link>
            </div>

            {/* Quick Join Widget */}
            <div id="join-code" className="mt-14 max-w-xl mx-auto">
              <QuickJoinForm />
            </div>

            {/* Asosiy ko'rsatkichlar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="glass-panel p-5 rounded-2xl">
                <div className="text-3xl font-extrabold text-emerald-400">1000+</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Bir vaqtda talaba</div>
              </div>
              <div className="glass-panel p-5 rounded-2xl">
                <div className="text-3xl font-extrabold text-teal-400">100%</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Avto-baholash va aniqlik</div>
              </div>
              <div className="glass-panel p-5 rounded-2xl">
                <div className="text-3xl font-extrabold text-amber-400">0 soniya</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Kutish va qotishlarsiz</div>
              </div>
              <div className="glass-panel p-5 rounded-2xl">
                <div className="text-3xl font-extrabold text-slate-200">Excel / PDF</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Tezkor hisobot eksporti</div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTLAR KATALOGI */}
        <section id="tests-catalog" className="py-16 md:py-24 bg-[#10141D] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Diagnostika va Sinov
                </div>
                <h2 className="text-3xl font-extrabold text-white">
                  Mavjud Testlar Katalogi
                </h2>
                <p className="text-slate-400 text-sm mt-2 max-w-xl">
                  Universitet fanlari, oraliq nazoratlar hamda mantiqiy-psixologik diagnostika testlari to&apos;plami.
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Jami faol testlar: <span className="font-bold text-white">{tests.length} ta</span>
              </div>
            </div>

            {tests.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-2xl">
                <Brain className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white">Hozircha faol testlar yo&apos;q</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Yaqin orada yangi testlar e&apos;lon qilinadi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test: any) => (
                  <div
                    key={test.id}
                    className="glass-panel rounded-2xl p-6 flex flex-col justify-between glass-card-hover group border border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/25">
                          {test.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{test.timeLimit} daqiqa</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 mt-1">
                        {test.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                        {test.description || "Ushbu test bo'yicha talabalarning bilimi va amaliy ko'nikmalari baholanadi."}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-medium">
                        <span>O&apos;tish bali: <strong className="text-white">{test.passingScore}%</strong></span>
                        <span>Savollar: <strong className="text-white">{test._count?.questions || 0} ta</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/exam/${test.accessCode}`}
                          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-center text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Testni boshlash</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* QANDAY ISHLAYDI? */}
        <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              Oddiy va Qulay
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Platformadan Foydalanish Jarayoni
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              To&apos;rtta oddiy qadam orqali talabalardan test oling va shaffof tahlillarga ega bo&apos;ling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-extrabold text-lg mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-white mb-2">Talaba hisobi yoki Link</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Har bir talaba shaxsiy hisobiga kiradi yoki to&apos;g&apos;ridan-to&apos;g&apos;ri ommaviy test kodi orqali ulanadi.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center font-extrabold text-lg mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-white mb-2">Testni Yechish</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Talaba taymer ostida A, B, C, D variantlarini belgilaydi. Internet uzilsa ham javoblar avtomatik saqlanib turadi.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-extrabold text-lg mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-white mb-2">Avtomatik Baholash</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tizim 1 soniyada to&apos;g&apos;ri va noto&apos;g&apos;ri javoblarni hisoblab, yakuniy ball va foizni chiqaradi.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-slate-700/30 border border-slate-600 text-slate-300 flex items-center justify-center font-extrabold text-lg mb-4">
                04
              </div>
              <h4 className="text-base font-bold text-white mb-2">Natijalar va Hisobot</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Barcha guruhlar bo&apos;yicha natijalar xavfsiz saqlanadi va Excel formatida tahlil qilinadi.
              </p>
            </div>
          </div>
        </section>

        {/* AFZALLIKLAR SECTION */}
        <section id="features" className="py-20 bg-[#10141D] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-white">
                Universitet Uchun Maxsus Imkoniyatlar
              </h2>
              <p className="text-slate-400 text-sm mt-3">
                Katta hajmdagi talabalar oqimini qiynalmasdan boshqarish uchun eng zamonaviy vositalar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-7 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Talabalar CRM Boshqaruvi</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Har bir talabani kiritish, unga alohida login-parol berish, fakultet va guruhlar
                  kesimida boshqarish hamda ro&apos;yxatni ommaviy yuklash imkoniyati.
                </p>
              </div>

              <div className="glass-panel p-7 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-5">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ommaviy Havola va QR-Kod</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Auditoriyadagi 100+ talaba bitta QR-kodni skanerlab yoki havola orqali testga ulanishi mumkin.
                  Ortiqcha ro&apos;yxatdan o&apos;tish talab etilmaydi.
                </p>
              </div>

              <div className="glass-panel p-7 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Yuqori Tezlik va Barqarorlik</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zamonaviy raqamli infratuzilma orqali birdaniga yuzlab talabalar bir vaqtda test topshirganda ham
                  sayt tezkor ishlaydi, har bir talaba javobi xavfsiz va kafolatli saqlanadi.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
