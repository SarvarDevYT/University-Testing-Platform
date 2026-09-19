"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileQuestion,
  PlusCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Share2,
  ExternalLink,
  Edit,
  X,
  Check,
  Copy,
  AlertCircle,
  QrCode,
  Layers,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Yangi test modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Axborot Texnologiyalari");
  const [timeLimit, setTimeLimit] = useState(20);
  const [passingScore, setPassingScore] = useState(60);
  const [accessType, setAccessType] = useState<"all" | "selected">("all");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Ommaviy havola / QR-kod modal
  const [shareModalTest, setShareModalTest] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tezkor guruhlar dostup modal
  const [accessModalTest, setAccessModalTest] = useState<any | null>(null);
  const [modalAccessType, setModalAccessType] = useState<"all" | "selected">("all");
  const [modalSelectedGroups, setModalSelectedGroups] = useState<string[]>([]);
  const [savingAccess, setSavingAccess] = useState(false);

  const fetchTests = async () => {
    try {
      const [testsRes, groupsRes] = await Promise.all([
        fetch("/api/admin/tests"),
        fetch("/api/admin/groups"),
      ]);
      const data = await testsRes.json();
      const groupsData = await groupsRes.json();
      if (data.tests) setTests(data.tests);
      if (groupsData.groups) setGroups(groupsData.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          timeLimit,
          passingScore,
          allowedGroups: accessType === "all" ? [] : selectedGroups,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      setIsAddModalOpen(false);
      setTitle("");
      setDescription("");
      setAccessType("all");
      setSelectedGroups([]);
      fetchTests();
    } catch (err: any) {
      setModalError(err.message || "Test yaratib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  };

  const openAccessModal = (test: any) => {
    setAccessModalTest(test);
    const ag = test.allowedGroups || [];
    if (ag.length === 0) {
      setModalAccessType("all");
      setModalSelectedGroups([]);
    } else {
      setModalAccessType("selected");
      setModalSelectedGroups(ag);
    }
  };

  const handleSaveTestAccess = async () => {
    if (!accessModalTest) return;
    setSavingAccess(true);
    try {
      const newAllowedGroups = modalAccessType === "all" ? [] : modalSelectedGroups;
      const res = await fetch(`/api/admin/tests/${accessModalTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedGroups: newAllowedGroups,
        }),
      });
      if (res.ok) {
        setAccessModalTest(null);
        fetchTests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAccess(false);
    }
  };

  const handleDeleteTest = async (id: string, title: string) => {
    if (!confirm(`Haqiqatan ham "${title}" testini va barcha savollarini o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyShareLink = (accessCode: string) => {
    const url = `${window.location.origin}/exam/${accessCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha va Yangi Test */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Testlar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fanlar bo&apos;yicha testlar, savollar banki va ommaviy havolalar (Mass Link / QR-kod)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yangi Test Yaratish</span>
        </button>
      </div>

      {/* Testlar Ro'yxati Kartochkalari */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Testlar yuklanmoqda...
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-400 text-xs border border-white/10">
          Hozircha hech qanday test yaratilmagan. Yuqoridagi tugma orqali birinchi testni yarating!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between relative group hover:border-indigo-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-cyan-300 border border-indigo-500/30">
                    {test.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      test.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {test.isActive ? "Faol" : "Nofaol"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {test.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {test.description || "Tavsif kiritilmagan."}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/30 border border-white/5 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Vaqt</div>
                    <div className="font-bold text-white">{test.timeLimit} daq</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Savollar</div>
                    <div className="font-bold text-cyan-400">
                      {test._count?.questions || 0} ta
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">O&apos;tish</div>
                    <div className="font-bold text-emerald-400">{test.passingScore}%</div>
                  </div>
                </div>

                {/* Guruhlar dostup nishoni */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-300">Dostup:</span>
                  {(test.allowedGroups || []).length === 0 ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Barcha guruhlarga ochiq
                    </span>
                  ) : (
                    test.allowedGroups.map((g: string) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-500/30"
                      >
                        {g}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Amallar */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/tests/${test.id}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Savollar ({test._count?.questions || 0})</span>
                </Link>

                <button
                  onClick={() => openAccessModal(test)}
                  title="Guruhlar dostupini sozlash"
                  className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShareModalTest(test)}
                  title="Ommaviy havola va QR-kod"
                  className="p-2 rounded-xl bg-[#1C2541] hover:bg-[#253259] text-cyan-400 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteTest(test.id, test.title)}
                  title="Testni o'chirish"
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YANGI TEST YARATISH MODALI */}
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
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Yangi Test Yaratish</h3>
                <p className="text-xs text-slate-400">Fan yoki mavzu bo&apos;yicha yangi test yarating</p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Test Nomi *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Oliy matematika oraliq nazorati"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fan / Yo&apos;nalish (Kategoriya)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Masalan: Axborot Texnologiyalari, Matematika, Psixologiya..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vaqt Me&apos;yori (Daqiqada) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    O&apos;tish Bali (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tavsif (Ixtiyoriy)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Test bo'yicha yo'riqnoma yoki qisqacha tavsif..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Guruhlar dostupini sozlash */}
              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Testdan foydalanish huquqi (Dostup)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => {
                      setAccessType("all");
                      setSelectedGroups([]);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                      accessType === "all"
                        ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-[#141822] border-white/5 text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accessType"
                      checked={accessType === "all"}
                      onChange={() => {}}
                      className="text-emerald-500"
                    />
                    <span>Barcha guruhlarga ochiq</span>
                  </label>

                  <label
                    onClick={() => setAccessType("selected")}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                      accessType === "selected"
                        ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-[#141822] border-white/5 text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accessType"
                      checked={accessType === "selected"}
                      onChange={() => {}}
                      className="text-emerald-500"
                    />
                    <span>Faqat tanlangan guruhlar</span>
                  </label>
                </div>

                {accessType === "selected" && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="text-[11px] text-slate-400">
                      Ushbu testni topshirishga ruxsat beriladigan guruhlarni belgilang:
                    </div>
                    {groups.length === 0 ? (
                      <div className="text-[11px] text-amber-400">
                        Hali guruhlar yaratilmagan. Avval &quot;Guruhlar Boshqaruvi&quot; bo&apos;limida guruh yarating.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                        {groups.map((g) => {
                          const isSel = selectedGroups.includes(g.name);
                          return (
                            <label
                              key={g.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isSel
                                  ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300 font-bold"
                                  : "bg-[#141822] border-white/5 text-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGroups((prev) => [...prev, g.name]);
                                  } else {
                                    setSelectedGroups((prev) => prev.filter((name) => name !== g.name));
                                  }
                                }}
                                className="rounded text-emerald-600"
                              />
                              <span className="truncate">{g.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saqlanmoqda..." : "Testni Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GURUHLAR DOSTUPINI SOZLASH TEZKOR MODALI */}
      {accessModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setAccessModalTest(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Guruhlar Dostupini Sozlash</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{accessModalTest.title}</p>
              </div>
            </div>

            <div className="space-y-4 my-5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  onClick={() => {
                    setModalAccessType("all");
                    setModalSelectedGroups([]);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                    modalAccessType === "all"
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold"
                      : "bg-[#0A0D14] border-white/5 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="modalAccessType"
                    checked={modalAccessType === "all"}
                    onChange={() => {}}
                    className="text-emerald-500"
                  />
                  <span>Barchaga ochiq</span>
                </label>

                <label
                  onClick={() => setModalAccessType("selected")}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                    modalAccessType === "selected"
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold"
                      : "bg-[#0A0D14] border-white/5 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="modalAccessType"
                    checked={modalAccessType === "selected"}
                    onChange={() => {}}
                    className="text-emerald-500"
                  />
                  <span>Tanlangan guruhlar</span>
                </label>
              </div>

              {modalAccessType === "selected" && (
                <div className="p-3 rounded-xl bg-[#0A0D14] border border-white/5 space-y-2">
                  <div className="text-[11px] text-slate-400">
                    Ruxsat berilgan guruhlarni belgilang:
                  </div>
                  {groups.length === 0 ? (
                    <div className="text-[11px] text-amber-400 py-2">
                      Tizimda guruhlar mavjud emas. Avval guruh yarating.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {groups.map((g) => {
                        const isSel = modalSelectedGroups.includes(g.name);
                        return (
                          <label
                            key={g.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSel
                                ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300 font-bold"
                                : "bg-[#141822] border-white/5 text-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setModalSelectedGroups((prev) => [...prev, g.name]);
                                } else {
                                  setModalSelectedGroups((prev) => prev.filter((name) => name !== g.name));
                                }
                              }}
                              className="rounded text-emerald-600"
                            />
                            <span className="truncate">{g.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setAccessModalTest(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveTestAccess}
                disabled={savingAccess}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingAccess && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Dostupni Saqlash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OMMAVIY HAVOLA VA QR-KOD MODALI (Mass Link / QR) */}
      {shareModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative text-center">
            <button
              onClick={() => setShareModalTest(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Ommaviy Havola & QR-Kod
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Auditoriyadagi talabalar ushbu havola orqali bir zumda testga ulanishadi
            </p>

            {/* Havola qutisi */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-left mb-5">
              <div className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                Yagona Havola:
              </div>
              <div className="text-xs font-mono text-cyan-400 break-all select-all">
                {typeof window !== "undefined" ? `${window.location.origin}/exam/${shareModalTest.accessCode}` : ""}
              </div>
            </div>

            {/* Havolani nusxalash tugmasi */}
            <button
              onClick={() => copyShareLink(shareModalTest.accessCode)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "Havola nusxalandi!" : "Havolani Nusxalash"}</span>
            </button>

            <p className="text-[11px] text-slate-500 mt-4">
              Talaba havola orqali kirganda o&apos;z ism-familiyasi va guruhini kiritib testni yecha oladi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
