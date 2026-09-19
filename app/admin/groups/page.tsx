"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  PlusCircle,
  Search,
  Users,
  FileQuestion,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  UserPlus,
  ArrowRight,
  GraduationCap,
  Building,
} from "lucide-react";
import { formatDate } from "@/lib/format";

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Yangi guruh / tahrirlash modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Testlar dostupini sozlash modal
  const [assignTestsGroup, setAssignTestsGroup] = useState<any | null>(null);
  const [allTests, setAllTests] = useState<any[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [savingTests, setSavingTests] = useState(false);
  const [assignTestsSuccess, setAssignTestsSuccess] = useState(false);

  // Guruh talabalari modal
  const [viewStudentsGroup, setViewStudentsGroup] = useState<any | null>(null);
  const [groupStudents, setGroupStudents] = useState<any[]>([]);
  const [allAvailableStudents, setAllAvailableStudents] = useState<any[]>([]);
  const [selectedAddStudentId, setSelectedAddStudentId] = useState("");
  const [loadingGroupStudents, setLoadingGroupStudents] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/admin/groups");
      const data = await res.json();
      if (data.groups) setGroups(data.groups);
    } catch (err) {
      console.error("Guruhlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Guruh yaratish yoki yangilash
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const url = editingGroup
        ? `/api/admin/groups/${editingGroup.id}`
        : "/api/admin/groups";
      const method = editingGroup ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, faculty, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      setIsModalOpen(false);
      setEditingGroup(null);
      setName("");
      setFaculty("");
      setDescription("");
      fetchGroups();
    } catch (err: any) {
      setModalError(err.message || "Amalni bajarib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  };

  // Guruhni o'chirish
  const handleDeleteGroup = async (id: string, groupName: string) => {
    if (
      !confirm(
        `Haqiqatan ham "${groupName}" guruhini o'chirmoqchimisiz? Guruh talabalari guruhsiz qoladi.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (err) {
      console.error("Guruhni o'chirishda xatolik:", err);
    }
  };

  // Testlar dostup modalini ochish
  const openAssignTestsModal = async (group: any) => {
    setAssignTestsGroup(group);
    setAssignTestsSuccess(false);
    try {
      const res = await fetch(`/api/admin/groups/${group.id}`);
      const data = await res.json();
      if (data.tests) {
        setAllTests(data.tests);
        // Faqat shu guruhga biriktirilgan yoki barchaga ochiq testlar
        const initialSelected = data.tests
          .filter((t: any) => {
            const ag = t.allowedGroups || [];
            return ag.some((name: string) => name.toLowerCase() === group.name.toLowerCase());
          })
          .map((t: any) => t.id);
        setSelectedTestIds(initialSelected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Testlar dostupini saqlash
  const handleSaveAssignedTests = async () => {
    if (!assignTestsGroup) return;
    setSavingTests(true);
    try {
      const res = await fetch(`/api/admin/groups/${assignTestsGroup.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_tests",
          testIds: selectedTestIds,
        }),
      });
      if (res.ok) {
        setAssignTestsSuccess(true);
        setTimeout(() => {
          setAssignTestsGroup(null);
          fetchGroups();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTests(false);
    }
  };

  // Guruh talabalari modalini ochish
  const openViewStudentsModal = async (group: any) => {
    setViewStudentsGroup(group);
    setLoadingGroupStudents(true);
    try {
      const [groupRes, allStudentsRes] = await Promise.all([
        fetch(`/api/admin/groups/${group.id}`),
        fetch("/api/admin/students"),
      ]);
      const groupData = await groupRes.json();
      const allStudentsData = await allStudentsRes.json();

      if (groupData.students) setGroupStudents(groupData.students);
      if (allStudentsData.students) {
        // Shu guruhda bo'lmagan talabalar
        const others = allStudentsData.students.filter(
          (s: any) => s.groupName?.toLowerCase() !== group.name.toLowerCase()
        );
        setAllAvailableStudents(others);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroupStudents(false);
    }
  };

  // Talabani guruhga qo'shish
  const handleAddStudentToGroup = async () => {
    if (!selectedAddStudentId || !viewStudentsGroup) return;
    try {
      const res = await fetch(`/api/admin/groups/${viewStudentsGroup.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_students",
          studentIds: [selectedAddStudentId],
        }),
      });
      if (res.ok) {
        setSelectedAddStudentId("");
        openViewStudentsModal(viewStudentsGroup);
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Talabani guruhdan chiqarish
  const handleRemoveStudentFromGroup = async (studentId: string) => {
    if (!viewStudentsGroup) return;
    try {
      const res = await fetch(`/api/admin/groups/${viewStudentsGroup.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_student",
          studentId,
        }),
      });
      if (res.ok) {
        openViewStudentsModal(viewStudentsGroup);
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGroups = groups.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      (g.faculty && g.faculty.toLowerCase().includes(q)) ||
      (g.description && g.description.toLowerCase().includes(q))
    );
  });

  const totalStudents = groups.reduce((acc, g) => acc + (g.studentCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Sarlavha va Harakatlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-emerald-400" />
            <span>Guruhlar Boshqaruvi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Akademik guruhlarni yaratish, talabalarni biriktirish va testlar dostupini boshqarish
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGroup(null);
            setName("");
            setFaculty("");
            setDescription("");
            setModalError("");
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yangi Guruh Yaratish</span>
        </button>
      </div>

      {/* Statistika panellari */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{groups.length} ta</div>
            <div className="text-xs text-slate-400 font-medium">Jami Guruhlar</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{totalStudents} nafar</div>
            <div className="text-xs text-slate-400 font-medium">Guruhlardagi Talabalar</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">Nazoratli</div>
            <div className="text-xs text-slate-400 font-medium">Testlarga Guruhlar Dostupi</div>
          </div>
        </div>
      </div>

      {/* Qidiruv */}
      <div className="glass-panel p-3 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Guruh nomi yoki fakultet bo'yicha qidirish (masalan: DI-210)..."
          className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-slate-400 hover:text-white mr-2 text-xs"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Guruhlar Ro'yxati */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Guruhlar yuklanmoqda...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Hech qanday guruh topilmadi</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search
              ? "Qidiruv so'rovi bo'yicha hech narsa chiqmadi."
              : "Hali birorta ham guruh yaratilmagan. Yuqoridagi tugma orqali yangi guruh qo'shing."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Tepasi: Guruh nomi va harakatlar */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {group.name}
                      </span>
                      {group.description && (
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                          {group.description}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-2 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{group.faculty || "Fakultet ko'rsatilmagan"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingGroup(group);
                        setName(group.name);
                        setFaculty(group.faculty || "");
                        setDescription(group.description || "");
                        setModalError("");
                        setIsModalOpen(true);
                      }}
                      title="Tahrirlash"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      title="O'chirish"
                      className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ko'rsatkichlar */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  <div
                    onClick={() => openViewStudentsModal(group)}
                    className="p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all"
                  >
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Talabalar
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>{group.studentCount || 0} nafar</span>
                    </div>
                  </div>

                  <div
                    onClick={() => openAssignTestsModal(group)}
                    className="p-3 rounded-xl bg-[#0A0D14] border border-white/5 hover:border-teal-500/30 cursor-pointer transition-all"
                  >
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Testlar Dostupi
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1">
                      <KeyRound className="w-4 h-4 text-teal-400" />
                      <span>{group.testCount || 0} ta</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pastki tugmalar */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => openViewStudentsModal(group)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Talabalar</span>
                </button>

                <button
                  onClick={() => openAssignTestsModal(group)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dostup Berish</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Yangi guruh / Tahrirlash */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-emerald-400" />
              <span>{editingGroup ? "Guruhni Tahrirlash" : "Yangi Guruh Yaratish"}</span>
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Akademik guruh ma&apos;lumotlarini to&apos;ldiring
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Guruh Nomi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: DI-210, KI-104, AT-2026..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141822] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fakultet Nomi
                </label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="Masalan: Kompyuter injiniringi..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141822] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tavsif yoki Kurs (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masalan: 3-kurs, Kunduzgi ta'lim..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141822] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{editingGroup ? "O'zgarishlarni Saqlash" : "Guruhni Yaratish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Testlar Dostupini Biriktirish */}
      {assignTestsGroup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setAssignTestsGroup(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/20">
                {assignTestsGroup.name} guruhi
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <span>Testlar Dostupini Sozlash</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ushbu guruh talabalari topshirishi mumkin bo&apos;lgan testlarni belgilang.
              </p>
            </div>

            {assignTestsSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>Dostup sozlamalari muvaffaqiyatli saqlandi!</span>
              </div>
            )}

            {/* Testlar tanlovi */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 py-2">
              <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                <span>Mavjud testlar ({allTests.length} ta)</span>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedTestIds(allTests.map((t) => t.id))}
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    Barchasini tanlash
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setSelectedTestIds([])}
                    className="text-slate-400 hover:text-white hover:underline"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>

              {allTests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Tizimda hali birorta ham test mavjud emas.
                </div>
              ) : (
                allTests.map((test) => {
                  const isChecked = selectedTestIds.includes(test.id);
                  const isPublic = (test.allowedGroups || []).length === 0;

                  return (
                    <label
                      key={test.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-emerald-950/40 border-emerald-500/40"
                          : "bg-[#0A0D14] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTestIds((prev) => [...prev, test.id]);
                          } else {
                            setSelectedTestIds((prev) => prev.filter((id) => id !== test.id));
                          }
                        }}
                        className="mt-0.5 rounded border-white/20 text-emerald-600 focus:ring-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{test.title}</span>
                          {isPublic && !isChecked && (
                            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                              Hamma uchun ochiq
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Fan: {test.category}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setAssignTestsGroup(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Yopish
              </button>
              <button
                onClick={handleSaveAssignedTests}
                disabled={savingTests}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingTests && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Dostupni Saqlash ({selectedTestIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Guruh Talabalari */}
      {viewStudentsGroup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setViewStudentsGroup(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/20">
                {viewStudentsGroup.name}
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Guruh Talabalari Ro&apos;yxati ({groupStudents.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ushbu guruhga biriktirilgan barcha talabalar ro&apos;yxati
              </p>
            </div>

            {/* Talaba qo'shish qatori */}
            <div className="p-3 rounded-2xl bg-[#0A0D14] border border-white/10 flex flex-col sm:flex-row items-center gap-2 mb-4">
              <select
                value={selectedAddStudentId}
                onChange={(e) => setSelectedAddStudentId(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-[#141822] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">Guruhga boshqa talabani biriktirish...</option>
                {allAvailableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.username}) {s.groupName ? `[${s.groupName}]` : "[Guruhsiz]"}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddStudentToGroup}
                disabled={!selectedAddStudentId}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Guruhga qo&apos;shish</span>
              </button>
            </div>

            {/* Talabalar jadvali */}
            <div className="flex-1 overflow-y-auto pr-1">
              {loadingGroupStudents ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Talabalar yuklanmoqda...</p>
                </div>
              ) : groupStudents.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Ushbu guruhda hozircha talabalar mavjud emas. Yuqoridagi qatordan talaba biriktirishingiz mumkin.
                </div>
              ) : (
                <div className="space-y-2">
                  {groupStudents.map((student, idx) => (
                    <div
                      key={student.id}
                      className="p-3 rounded-xl bg-[#0A0D14] border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{student.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Login: {student.username} {student.phone ? `• Tel: ${student.phone}` : ""}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveStudentFromGroup(student.id)}
                        title="Guruhdan chiqarish"
                        className="px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Guruhdan chiqarish</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end mt-2">
              <button
                onClick={() => setViewStudentsGroup(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
