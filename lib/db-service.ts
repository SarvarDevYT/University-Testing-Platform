import prisma from "./prisma";
import { hashPassword } from "./auth";
import fs from "fs";
import path from "path";
import os from "os";

export interface UserDTO {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: "ADMIN" | "STUDENT";
  faculty?: string | null;
  groupName?: string | null;
  phone?: string | null;
  createdAt: Date;
}

export interface QuestionDTO {
  id: string;
  testId: string;
  questionText: string;
  points: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  orderIndex: number;
}

export interface GroupDTO {
  id: string;
  name: string;
  faculty?: string | null;
  description?: string | null;
  createdAt: Date;
  studentCount?: number;
  testCount?: number;
}

export interface TestDTO {
  id: string;
  title: string;
  description: string | null;
  category: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  accessCode: string;
  allowedGroups?: string[]; // Ruxsat berilgan guruhlar ro'yxati (masalan: ["DI-210", "KI-104"])
  createdAt: Date;
  questions?: QuestionDTO[];
  _count?: {
    questions: number;
    results: number;
  };
}

export interface TestResultDTO {
  id: string;
  testId: string;
  testTitle?: string;
  userId?: string | null;
  userFullName?: string | null;
  userGroup?: string | null;
  guestName?: string | null;
  guestGroup?: string | null;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  passed: boolean;
  timeSpentSeconds: number;
  answersJson: string;
  createdAt: Date;
}

// Lokal fayl bazasi (agar Neon DB hali ulanmagan bo'lsa avtomatik zaxira)
const LOCAL_DATA_FILE = path.join(process.cwd(), "prisma", "local_backup_store.json");
const TMP_DATA_FILE = path.join(os.tmpdir(), "local_backup_store.json");

function getLocalDataFilePath(): string {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.accessSync(dir, fs.constants.W_OK);
    return LOCAL_DATA_FILE;
  } catch {
    return TMP_DATA_FILE;
  }
}

interface StoreData {
  users: any[];
  groups: any[];
  tests: any[];
  questions: any[];
  results: any[];
  deletedIds?: string[];
}

function parseAllowedGroups(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function getInitialStore(): StoreData {
  return {
    users: [
      {
        id: "admin-1",
        username: "adminuniver",
        password: "$2b$10$4TvrJV1wfqtw6FmjKdWlE..XwiL2dzuKeRrocgdRwvyoJ2Tixy2DW", // universityadminuz
        fullName: "Universitet Bosh Administratori",
        role: "ADMIN",
        faculty: "Rektorat",
        groupName: "Admin",
        phone: "+998 90 123 45 67",
        createdAt: new Date().toISOString(),
      },
    ],
    groups: [],
    tests: [],
    questions: [],
    results: [],
    deletedIds: [],
  };
}

function readLocalStore(): StoreData {
  try {
    const filePath = getLocalDataFilePath();
    if (!fs.existsSync(filePath)) {
      const initial = getInitialStore();
      writeLocalStore(initial);
      return initial;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed: StoreData = JSON.parse(content);
    if (!parsed.deletedIds) parsed.deletedIds = [];
    if (!parsed.groups) parsed.groups = [];

    // O'chirilgan ID larni to'liq tozalash
    parsed.tests = (parsed.tests || []).filter((t: any) => !parsed.deletedIds?.includes(t.id));
    parsed.groups = (parsed.groups || []).filter((g: any) => !parsed.deletedIds?.includes(g.id));
    parsed.users = (parsed.users || []).filter((u: any) => !parsed.deletedIds?.includes(u.id));
    parsed.questions = (parsed.questions || []).filter((q: any) => !parsed.deletedIds?.includes(q.id));
    parsed.results = (parsed.results || []).filter((r: any) => !parsed.deletedIds?.includes(r.id));

    return parsed;
  } catch {
    return getInitialStore();
  }
}

function writeLocalStore(data: StoreData) {
  const filePath = getLocalDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e2) {
      console.error("Local store write error:", err, e2);
    }
  }
}

// Baza turini tekshirish (Prisma / SQLite / Postgres mavjudmi?)
let isPostgresHealthy: boolean | null = null;

async function checkPostgres(): Promise<boolean> {
  if (isPostgresHealthy === true) return true;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("npg_placeholder")) {
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPostgresHealthy = true;
    return true;
  } catch (err) {
    console.error("Prisma database check error:", err);
    return false;
  }
}

function generateSecurePassword(length = 8): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

function generateCleanUsername(fullName: string, index: number): string {
  const clean = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .trim()
    .split(/\s+/)[0] || "std";
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${randomSuffix}`;
}

export const dbService = {
  // Foydalanuvchini topish (username orqali)
  async getUserByUsername(username: string) {
    if (await checkPostgres()) {
      let user = await prisma.user.findUnique({
        where: { username },
      });

      // Agar Postgres yangi bo'lsa va admin hali kiritilmagan bo'lsa, avtomatik yaratish
      if (!user && username.toLowerCase() === "adminuniver") {
        try {
          user = await prisma.user.create({
            data: {
              username: "adminuniver",
              password: "$2b$10$4TvrJV1wfqtw6FmjKdWlE..XwiL2dzuKeRrocgdRwvyoJ2Tixy2DW", // universityadminuz
              fullName: "Universitet Bosh Administratori",
              role: "ADMIN",
              faculty: "Rektorat",
              groupName: "Admin",
              phone: "+998 90 123 45 67",
            },
          });
        } catch (err) {
          console.error("Postgres auto-create admin error:", err);
        }
      }

      return user;
    }
    const store = readLocalStore();
    return store.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  // Foydalanuvchini id orqali topish
  async getUserById(id: string) {
    if (await checkPostgres()) {
      return await prisma.user.findUnique({
        where: { id },
      });
    }
    const store = readLocalStore();
    return store.users.find((u) => u.id === id) || null;
  },

  // Barcha talabalar ro'yxati
  async getStudents() {
    if (await checkPostgres()) {
      return await prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          faculty: true,
          groupName: true,
          phone: true,
          createdAt: true,
          _count: {
            select: { results: true },
          },
        },
      });
    }
    const store = readLocalStore();
    return store.users
      .filter((u) => u.role === "STUDENT")
      .map((u) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        faculty: u.faculty,
        groupName: u.groupName,
        phone: u.phone,
        createdAt: new Date(u.createdAt),
        _count: {
          results: store.results.filter((r) => r.userId === u.id).length,
        },
      }));
  },

  // Yangi talaba yaratish
  async createStudent(data: {
    fullName: string;
    username: string;
    passwordPlain: string;
    faculty?: string;
    groupName?: string;
    phone?: string;
  }) {
    const hashedPassword = await hashPassword(data.passwordPlain);

    const rawGroup = data.groupName?.trim();
    let finalGroupName = rawGroup || null;
    let finalFaculty = data.faculty?.trim() || null;

    if (rawGroup) {
      if (await checkPostgres()) {
        const allGroups = await (prisma as any).group.findMany();
        const existingGroup = allGroups.find(
          (g: any) => g.name.trim().toLowerCase() === rawGroup.toLowerCase()
        );

        if (existingGroup) {
          finalGroupName = existingGroup.name;
          if (!finalFaculty && existingGroup.faculty) {
            finalFaculty = existingGroup.faculty;
          }
        } else {
          try {
            const createdGroup = await (prisma as any).group.create({
              data: {
                name: rawGroup,
                faculty: finalFaculty,
              },
            });
            finalGroupName = createdGroup.name;
          } catch {}
        }
      } else {
        const store = readLocalStore();
        if (!store.groups) store.groups = [];
        const existingGroup = store.groups.find(
          (g: any) => g.name.trim().toLowerCase() === rawGroup.toLowerCase()
        );
        if (existingGroup) {
          finalGroupName = existingGroup.name;
          if (!finalFaculty && existingGroup.faculty) {
            finalFaculty = existingGroup.faculty;
          }
        } else {
          store.groups.push({
            id: "grp-" + Date.now(),
            name: rawGroup,
            faculty: finalFaculty,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          writeLocalStore(store);
        }
      }
    }

    if (await checkPostgres()) {
      return await prisma.user.create({
        data: {
          fullName: data.fullName,
          username: data.username,
          password: hashedPassword,
          role: "STUDENT",
          faculty: finalFaculty,
          groupName: finalGroupName,
          phone: data.phone || null,
        },
      });
    }

    const store = readLocalStore();
    const existing = store.users.find((u) => u.username.toLowerCase() === data.username.toLowerCase());
    if (existing) {
      throw new Error("Bunday loginli talaba allaqachon mavjud!");
    }

    const newUser = {
      id: "std-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      username: data.username,
      password: hashedPassword,
      fullName: data.fullName,
      role: "STUDENT",
      faculty: finalFaculty,
      groupName: finalGroupName,
      phone: data.phone || null,
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    writeLocalStore(store);
    return newUser;
  },

  // Ommaviy talabalarni Excel orqali qo'shish va avto login/parol yaratish
  async importStudents(
    students: Array<{
      fullName: string;
      groupName?: string;
      faculty?: string;
      phone?: string;
      username?: string;
      passwordPlain?: string;
    }>
  ) {
    const results: Array<{
      id: string;
      fullName: string;
      username: string;
      passwordPlain: string;
      groupName?: string | null;
      faculty?: string | null;
      phone?: string | null;
    }> = [];

    const isPg = await checkPostgres();
    const store = readLocalStore();
    let allGroups: any[] = [];
    if (isPg) {
      allGroups = await (prisma as any).group.findMany();
    } else {
      if (!store.groups) store.groups = [];
      allGroups = store.groups;
    }

    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      if (!item.fullName || !item.fullName.trim()) continue;

      let rawGroup = item.groupName?.trim();
      let finalGroupName = rawGroup || null;
      let finalFaculty = item.faculty?.trim() || null;

      if (rawGroup) {
        if (isPg) {
          let matched = allGroups.find(
            (g: any) => g.name.trim().toLowerCase() === rawGroup!.toLowerCase()
          );
          if (matched) {
            finalGroupName = matched.name;
            if (!finalFaculty && matched.faculty) finalFaculty = matched.faculty;
          } else {
            try {
              matched = await (prisma as any).group.create({
                data: { name: rawGroup, faculty: finalFaculty },
              });
              allGroups.push(matched);
              finalGroupName = matched.name;
            } catch {}
          }
        } else {
          let matched = store.groups.find(
            (g: any) => g.name.trim().toLowerCase() === rawGroup!.toLowerCase()
          );
          if (matched) {
            finalGroupName = matched.name;
            if (!finalFaculty && matched.faculty) finalFaculty = matched.faculty;
          } else {
            const newG = {
              id: "grp-" + Date.now() + "-" + i,
              name: rawGroup,
              faculty: finalFaculty,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            store.groups.push(newG);
            finalGroupName = newG.name;
          }
        }
      }

      let plainPass = item.passwordPlain?.trim() || generateSecurePassword(8);
      let username = item.username?.trim().toLowerCase();
      if (!username) {
        username = generateCleanUsername(item.fullName, i);
      }

      // Dublikatlarni tekshirish va unikal username yaratish
      let finalUsername = username;
      let counter = 1;
      while (
        (isPg && (await prisma.user.findUnique({ where: { username: finalUsername } }))) ||
        (!isPg && store.users.some((u) => u.username.toLowerCase() === finalUsername.toLowerCase()))
      ) {
        finalUsername = `${username}_${counter++}`;
      }

      const hashedPassword = await hashPassword(plainPass);

      if (isPg) {
        const created = await prisma.user.create({
          data: {
            fullName: item.fullName.trim(),
            username: finalUsername,
            password: hashedPassword,
            role: "STUDENT",
            groupName: finalGroupName,
            faculty: finalFaculty,
            phone: item.phone?.trim() || null,
          },
        });
        results.push({
          id: created.id,
          fullName: created.fullName,
          username: created.username,
          passwordPlain: plainPass,
          groupName: created.groupName,
          faculty: created.faculty,
          phone: created.phone,
        });
      } else {
        const newId = "std-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
        const newUser = {
          id: newId,
          username: finalUsername,
          password: hashedPassword,
          fullName: item.fullName.trim(),
          role: "STUDENT",
          groupName: finalGroupName,
          faculty: finalFaculty,
          phone: item.phone?.trim() || null,
          createdAt: new Date().toISOString(),
        };
        store.users.push(newUser);
        results.push({
          id: newUser.id,
          fullName: newUser.fullName,
          username: newUser.username,
          passwordPlain: plainPass,
          groupName: newUser.groupName,
          faculty: newUser.faculty,
          phone: newUser.phone,
        });
      }
    }

    if (!isPg) {
      writeLocalStore(store);
    }

    return results;
  },

  // Talaba parolini yangilash
  async resetStudentPassword(userId: string, newPasswordPlain: string) {
    const hashedPassword = await hashPassword(newPasswordPlain);
    if (await checkPostgres()) {
      return await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    const store = readLocalStore();
    const user = store.users.find((u) => u.id === userId);
    if (user) {
      user.password = hashedPassword;
      writeLocalStore(store);
    }
    return user;
  },

  // Talabani o'chirish (Natijalari bilan birga to'liq tozalash)
  async deleteStudent(userId: string) {
    if (await checkPostgres()) {
      try {
        await prisma.testResult.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } }).catch((err) => {
          console.warn("Postgres user delete warning:", err?.message);
        });
      } catch (err) {
        console.error("Postgres deleteStudent error:", err);
      }
    }
    const store = readLocalStore();
    store.users = store.users.filter((u) => u.id !== userId);
    store.results = store.results.filter((r) => r.userId !== userId);
    if (!store.deletedIds) store.deletedIds = [];
    if (!store.deletedIds.includes(userId)) store.deletedIds.push(userId);
    writeLocalStore(store);
    return true;
  },

  // Barcha testlarni olish (Admin yoki Landing uchun)
  async getTests(onlyActive = false) {
    if (await checkPostgres()) {
      const tests = await (prisma.test as any).findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { questions: true, results: true },
          },
        },
      });
      return tests.map((t: any) => ({
        ...t,
        allowedGroups: parseAllowedGroups(t.allowedGroups),
      }));
    }

    const store = readLocalStore();
    let list = store.tests;
    if (onlyActive) {
      list = list.filter((t) => t.isActive);
    }

    return list.map((t) => ({
      ...t,
      allowedGroups: parseAllowedGroups(t.allowedGroups),
      createdAt: new Date(t.createdAt),
      _count: {
        questions: store.questions.filter((q) => q.testId === t.id).length,
        results: store.results.filter((r) => r.testId === t.id).length,
      },
    }));
  },

  // Testni ID bo'yicha olish (savollari bilan)
  async getTestById(id: string, includeAnswers = false) {
    if (await checkPostgres()) {
      const test = await (prisma.test as any).findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
      if (!test) return null;
      if (!includeAnswers) {
        test.questions = test.questions.map((q: any) => ({
          ...q,
          correctAnswer: "", // Talabaga to'g'ri javobni ko'rsatmaslik!
        }));
      }
      return {
        ...test,
        allowedGroups: parseAllowedGroups(test.allowedGroups),
      };
    }

    const store = readLocalStore();
    const test = store.tests.find((t) => t.id === id);
    if (!test) return null;

    const questions = store.questions
      .filter((q) => q.testId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((q) => {
        if (!includeAnswers) {
          return { ...q, correctAnswer: "" };
        }
        return q;
      });

    return {
      ...test,
      allowedGroups: parseAllowedGroups(test.allowedGroups),
      questions,
      createdAt: new Date(test.createdAt),
    };
  },

  // Testni Ommaviy havola (accessCode) orqali olish
  async getTestByAccessCode(accessCode: string) {
    const cleanCode = (accessCode || "").trim();
    if (!cleanCode) return null;

    if (await checkPostgres()) {
      const test = await (prisma.test as any).findFirst({
        where: {
          OR: [
            { accessCode: { equals: cleanCode } },
            { id: cleanCode },
          ],
        },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
      if (!test || !test.isActive) return null;
      test.questions = test.questions.map((q: any) => ({
        ...q,
        correctAnswer: "", // xavfsizlik: to'g'ri javob yashiriladi
      }));
      return {
        ...test,
        allowedGroups: parseAllowedGroups(test.allowedGroups),
      };
    }

    const store = readLocalStore();
    const test = store.tests.find(
      (t) =>
        (t.accessCode?.toLowerCase() === cleanCode.toLowerCase() || t.id === cleanCode) &&
        t.isActive
    );
    if (!test) return null;

    const questions = store.questions
      .filter((q) => q.testId === test.id)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((q) => ({ ...q, correctAnswer: "" }));

    return {
      ...test,
      allowedGroups: parseAllowedGroups(test.allowedGroups),
      questions,
      createdAt: new Date(test.createdAt),
    };
  },

  // Yangi test yaratish
  async createTest(data: {
    title: string;
    description?: string;
    category: string;
    timeLimit: number;
    passingScore: number;
    isActive?: boolean;
    allowedGroups?: string[];
  }) {
    const accessCode = "test-" + Math.random().toString(36).substring(2, 8);
    const groupsList = data.allowedGroups || [];

    if (await checkPostgres()) {
      const created = await (prisma.test as any).create({
        data: {
          title: data.title,
          description: data.description || null,
          category: data.category || "Umumiy",
          timeLimit: data.timeLimit || 20,
          passingScore: data.passingScore || 60,
          isActive: data.isActive !== undefined ? data.isActive : true,
          accessCode,
          allowedGroups: groupsList.length > 0 ? JSON.stringify(groupsList) : null,
        },
      });
      return { ...created, allowedGroups: groupsList };
    }

    const store = readLocalStore();
    const newTest = {
      id: "test-" + Date.now(),
      title: data.title,
      description: data.description || null,
      category: data.category || "Umumiy",
      timeLimit: data.timeLimit || 20,
      passingScore: data.passingScore || 60,
      isActive: data.isActive !== undefined ? data.isActive : true,
      accessCode,
      allowedGroups: groupsList,
      createdAt: new Date().toISOString(),
    };
    store.tests.push(newTest);
    writeLocalStore(store);
    return newTest;
  },

  // Testni yangilash
  async updateTest(id: string, data: Partial<TestDTO>) {
    if (await checkPostgres()) {
      const updated = await (prisma.test as any).update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          isActive: data.isActive,
          allowedGroups: data.allowedGroups !== undefined
            ? (data.allowedGroups.length > 0 ? JSON.stringify(data.allowedGroups) : null)
            : undefined,
        },
      });
      return {
        ...updated,
        allowedGroups: parseAllowedGroups(updated.allowedGroups),
      };
    }

    const store = readLocalStore();
    const index = store.tests.findIndex((t) => t.id === id);
    if (index !== -1) {
      store.tests[index] = {
        ...store.tests[index],
        ...data,
        allowedGroups: data.allowedGroups !== undefined ? data.allowedGroups : store.tests[index].allowedGroups,
      };
      writeLocalStore(store);
      return store.tests[index];
    }
    return null;
  },

  // Testni o'chirish (Savollari va natijalari bilan bazadan to'liq tozalash)
  async deleteTest(id: string) {
    if (await checkPostgres()) {
      try {
        await prisma.testResult.deleteMany({ where: { testId: id } });
        await prisma.question.deleteMany({ where: { testId: id } });
        await prisma.test.delete({ where: { id } }).catch((err) => {
          console.warn("Postgres test delete warning:", err?.message);
        });
      } catch (err) {
        console.error("Postgres deleteTest error:", err);
      }
    }

    const store = readLocalStore();
    store.tests = store.tests.filter((t) => t.id !== id);
    store.questions = store.questions.filter((q) => q.testId !== id);
    store.results = store.results.filter((r) => r.testId !== id);
    if (!store.deletedIds) store.deletedIds = [];
    if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
    writeLocalStore(store);
    return true;
  },

  // Savol qo'shish
  async addQuestion(data: {
    testId: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    points?: number;
  }) {
    if (await checkPostgres()) {
      const count = await prisma.question.count({ where: { testId: data.testId } });
      return await prisma.question.create({
        data: {
          testId: data.testId,
          questionText: data.questionText,
          optionA: data.optionA,
          optionB: data.optionB,
          optionC: data.optionC,
          optionD: data.optionD,
          correctAnswer: data.correctAnswer,
          points: data.points || 1,
          orderIndex: count,
        },
      });
    }

    const store = readLocalStore();
    const count = store.questions.filter((q) => q.testId === data.testId).length;
    const newQ = {
      id: "q-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      testId: data.testId,
      questionText: data.questionText,
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      correctAnswer: data.correctAnswer,
      points: data.points || 1,
      orderIndex: count,
    };
    store.questions.push(newQ);
    writeLocalStore(store);
    return newQ;
  },

  // Savolni o'chirish
  async deleteQuestion(id: string) {
    if (await checkPostgres()) {
      try {
        await prisma.question.delete({ where: { id } }).catch((err) => {
          console.warn("Postgres question delete warning:", err?.message);
        });
      } catch (err) {
        console.error("Postgres deleteQuestion error:", err);
      }
    }
    const store = readLocalStore();
    store.questions = store.questions.filter((q) => q.id !== id);
    if (!store.deletedIds) store.deletedIds = [];
    if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
    writeLocalStore(store);
    return true;
  },

  // Ommaviy savollarni yuklash (Matn yoki Excel orqali)
  async importQuestions(
    testId: string,
    questions: Array<{
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: "A" | "B" | "C" | "D";
      points?: number;
    }>
  ) {
    if (await checkPostgres()) {
      const currentCount = await prisma.question.count({ where: { testId } });
      const created = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const item = await prisma.question.create({
          data: {
            testId,
            questionText: q.questionText.trim(),
            optionA: q.optionA.trim(),
            optionB: q.optionB.trim(),
            optionC: q.optionC.trim(),
            optionD: q.optionD.trim(),
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            orderIndex: currentCount + i,
          },
        });
        created.push(item);
      }
      return created;
    }

    const store = readLocalStore();
    const currentCount = store.questions.filter((q) => q.testId === testId).length;
    const newQuestions = questions.map((q, idx) => ({
      id: "q-" + Date.now() + "-" + idx + "-" + Math.random().toString(36).substring(2, 6),
      testId,
      questionText: q.questionText.trim(),
      optionA: q.optionA.trim(),
      optionB: q.optionB.trim(),
      optionC: q.optionC.trim(),
      optionD: q.optionD.trim(),
      correctAnswer: q.correctAnswer,
      points: q.points || 1,
      orderIndex: currentCount + idx,
    }));
    store.questions.push(...newQuestions);
    writeLocalStore(store);
    return newQuestions;
  },

  // Test natijasini saqlash (ball hisoblash)
  async submitExam(params: {
    testId: string;
    userId?: string | null;
    guestName?: string | null;
    guestGroup?: string | null;
    answers: Record<string, string>; // { questionId: "A" | "B" | ... }
    timeSpentSeconds: number;
  }) {
    // 1. Haqiqiy savollar va to'g'ri javoblarni olish
    let questions: QuestionDTO[] = [];
    let passingScore = 60;

    if (await checkPostgres()) {
      const test = await prisma.test.findUnique({
        where: { id: params.testId },
        include: { questions: true },
      });
      if (!test) throw new Error("Test topilmadi");
      questions = test.questions as QuestionDTO[];
      passingScore = test.passingScore;
    } else {
      const store = readLocalStore();
      const test = store.tests.find((t) => t.id === params.testId);
      if (!test) throw new Error("Test topilmadi");
      questions = store.questions.filter((q) => q.testId === params.testId);
      passingScore = test.passingScore;
    }

    // 2. Ballarni hisoblash
    const totalQuestions = questions.length;
    let correctAnswers = 0;

    for (const q of questions) {
      const studentAns = params.answers[q.id];
      if (studentAns && studentAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
        correctAnswers++;
      }
    }

    const scorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = scorePercent >= passingScore;

    // 3. Natijani bazaga yozish
    const answersJson = JSON.stringify(params.answers);

    if (await checkPostgres()) {
      return await prisma.testResult.create({
        data: {
          testId: params.testId,
          userId: params.userId || null,
          guestName: params.guestName || null,
          guestGroup: params.guestGroup || null,
          totalQuestions,
          correctAnswers,
          scorePercent,
          passed,
          timeSpentSeconds: params.timeSpentSeconds,
          answersJson,
        },
        include: {
          test: true,
          user: true,
        },
      });
    }

    const store = readLocalStore();
    const resultId = "res-" + Date.now();
    const newResult = {
      id: resultId,
      testId: params.testId,
      userId: params.userId || null,
      guestName: params.guestName || null,
      guestGroup: params.guestGroup || null,
      totalQuestions,
      correctAnswers,
      scorePercent,
      passed,
      timeSpentSeconds: params.timeSpentSeconds,
      answersJson,
      createdAt: new Date().toISOString(),
    };
    store.results.push(newResult);
    writeLocalStore(store);

    const test = store.tests.find((t) => t.id === params.testId);
    const user = store.users.find((u) => u.id === params.userId);

    return {
      ...newResult,
      test,
      user,
    };
  },

  // Barcha natijalarni olish (Admin CRM monitoring)
  async getAllResults() {
    if (await checkPostgres()) {
      return await prisma.testResult.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          test: true,
          user: true,
        },
      });
    }

    const store = readLocalStore();
    return store.results
      .map((r) => {
        const test = store.tests.find((t) => t.id === r.testId);
        const user = store.users.find((u) => u.id === r.userId);
        return {
          ...r,
          createdAt: new Date(r.createdAt),
          test,
          user,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Talabaning o'z natijalari
  async getStudentResults(userId: string) {
    if (await checkPostgres()) {
      return await prisma.testResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          test: true,
        },
      });
    }

    const store = readLocalStore();
    return store.results
      .filter((r) => r.userId === userId)
      .map((r) => {
        const test = store.tests.find((t) => t.id === r.testId);
        return {
          ...r,
          createdAt: new Date(r.createdAt),
          test,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Natijani ID orqali olish (Natija sahifasi uchun)
  async getResultById(id: string) {
    if (await checkPostgres()) {
      return await prisma.testResult.findUnique({
        where: { id },
        include: {
          test: {
            include: {
              questions: true,
            },
          },
          user: true,
        },
      });
    }

    const store = readLocalStore();
    const res = store.results.find((r) => r.id === id);
    if (!res) return null;

    const test = store.tests.find((t) => t.id === res.testId);
    const questions = store.questions.filter((q) => q.testId === res.testId);
    const user = store.users.find((u) => u.id === res.userId);

    return {
      ...res,
      createdAt: new Date(res.createdAt),
      test: test ? { ...test, questions } : null,
      user: user || null,
    };
  },

  // Test natijasini o'chirish
  async deleteResult(id: string) {
    if (await checkPostgres()) {
      try {
        await prisma.testResult.delete({ where: { id } }).catch((err) => {
          console.warn("Postgres result delete warning:", err?.message);
        });
      } catch (err) {
        console.error("Postgres deleteResult error:", err);
      }
    }

    const store = readLocalStore();
    store.results = store.results.filter((r) => r.id !== id);
    if (!store.deletedIds) store.deletedIds = [];
    if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
    writeLocalStore(store);
    return true;
  },

  // Barcha natijalarni tozalash
  async deleteAllResults() {
    if (await checkPostgres()) {
      try {
        await prisma.testResult.deleteMany({});
      } catch (err) {
        console.error("Postgres deleteAllResults error:", err);
      }
    }

    const store = readLocalStore();
    store.results = [];
    writeLocalStore(store);
    return true;
  },

  // Admin Dashboard statistikalari
  async getDashboardStats() {
    if (await checkPostgres()) {
      const [totalStudents, totalTests, totalResults] = await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.test.count(),
        prisma.testResult.count(),
      ]);

      const recentResults = await prisma.testResult.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { test: true, user: true },
      });

      return {
        totalStudents,
        totalTests,
        totalResults,
        recentResults,
      };
    }

    const store = readLocalStore();
    return {
      totalStudents: store.users.filter((u) => u.role === "STUDENT").length,
      totalTests: store.tests.length,
      totalResults: store.results.length,
      recentResults: store.results.slice(-5).reverse().map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        test: store.tests.find((t) => t.id === r.testId),
        user: store.users.find((u) => u.id === r.userId),
      })),
    };
  },

  // Talaba testni avval topshirganmi yoki yo'qligini tekshirish (1 marta topshirish cheklovi)
  async hasStudentSubmitted(testId: string, userId: string): Promise<boolean> {
    if (await checkPostgres()) {
      const existing = await prisma.testResult.findFirst({
        where: { testId, userId },
      });
      return !!existing;
    }
    const store = readLocalStore();
    return store.results.some((r) => r.testId === testId && r.userId === userId);
  },

  // === GURUHLAR BOSHQARUVI (GROUPS CRM) ===
  async getGroups(): Promise<GroupDTO[]> {
    if (await checkPostgres()) {
      const groups = await (prisma as any).group.findMany({
        orderBy: { name: "asc" },
      });
      const allStudents = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { groupName: true },
      });
      const allTests = await (prisma.test as any).findMany({
        select: { allowedGroups: true },
      });

      return groups.map((g: any) => {
        const studentCount = allStudents.filter(
          (s: any) => s.groupName?.trim().toLowerCase() === g.name.trim().toLowerCase()
        ).length;
        const testCount = allTests.filter((t: any) => {
          const parsed = parseAllowedGroups(t.allowedGroups);
          return parsed.length === 0 || parsed.some((ag: string) => ag.toLowerCase() === g.name.toLowerCase());
        }).length;

        return {
          id: g.id,
          name: g.name,
          faculty: g.faculty,
          description: g.description,
          createdAt: g.createdAt,
          studentCount,
          testCount,
        };
      });
    }

    const store = readLocalStore();
    return (store.groups || []).map((g: any) => {
      const studentCount = store.users.filter(
        (u: any) => u.role === "STUDENT" && u.groupName?.trim().toLowerCase() === g.name.trim().toLowerCase()
      ).length;
      const testCount = store.tests.filter((t: any) => {
        const parsed = parseAllowedGroups(t.allowedGroups);
        return parsed.length === 0 || parsed.some((ag: string) => ag.toLowerCase() === g.name.toLowerCase());
      }).length;

      return {
        id: g.id,
        name: g.name,
        faculty: g.faculty,
        description: g.description,
        createdAt: new Date(g.createdAt),
        studentCount,
        testCount,
      };
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  },

  async getGroupById(id: string) {
    let group: any = null;
    let students: any[] = [];
    let tests: any[] = [];

    if (await checkPostgres()) {
      group = await (prisma as any).group.findUnique({ where: { id } });
      if (!group) return null;
      const allStudents = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true,
          username: true,
          fullName: true,
          faculty: true,
          groupName: true,
          phone: true,
          createdAt: true,
        },
        orderBy: { fullName: "asc" },
      });
      students = allStudents.filter(
        (s: any) => s.groupName?.trim().toLowerCase() === group.name.trim().toLowerCase()
      );
      const allTests = await (prisma.test as any).findMany({
        orderBy: { createdAt: "desc" },
      });
      tests = allTests.map((t: any) => {
        const parsed = parseAllowedGroups(t.allowedGroups);
        return {
          id: t.id,
          title: t.title,
          category: t.category,
          isActive: t.isActive,
          allowedGroups: parsed,
          isAssigned: parsed.length === 0 || parsed.some((ag: string) => ag.toLowerCase() === group.name.toLowerCase()),
        };
      });
    } else {
      const store = readLocalStore();
      group = (store.groups || []).find((g: any) => g.id === id);
      if (!group) return null;
      students = store.users
        .filter((u: any) => u.role === "STUDENT" && u.groupName?.trim().toLowerCase() === group.name.trim().toLowerCase())
        .map((u: any) => ({ ...u, password: undefined, createdAt: new Date(u.createdAt) }))
        .sort((a: any, b: any) => a.fullName.localeCompare(b.fullName));
      tests = store.tests.map((t: any) => {
        const parsed = parseAllowedGroups(t.allowedGroups);
        return {
          id: t.id,
          title: t.title,
          category: t.category,
          isActive: t.isActive,
          allowedGroups: parsed,
          createdAt: new Date(t.createdAt),
          isAssigned: parsed.length === 0 || parsed.some((ag: string) => ag.toLowerCase() === group.name.toLowerCase()),
        };
      });
    }

    return {
      group: {
        ...group,
        createdAt: new Date(group.createdAt),
        studentCount: students.length,
      },
      students,
      tests,
    };
  },

  async createGroup(data: { name: string; faculty?: string; description?: string }) {
    const cleanName = data.name.trim();
    if (!cleanName) throw new Error("Guruh nomi kiritilishi shart");

    if (await checkPostgres()) {
      const existing = await (prisma as any).group.findFirst({
        where: { name: { equals: cleanName } },
      });
      if (existing) throw new Error("Ushbu nomdagi guruh allaqachon mavjud!");

      return await (prisma as any).group.create({
        data: {
          name: cleanName,
          faculty: data.faculty?.trim() || null,
          description: data.description?.trim() || null,
        },
      });
    }

    const store = readLocalStore();
    if (!store.groups) store.groups = [];
    const existing = store.groups.find((g: any) => g.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) throw new Error("Ushbu nomdagi guruh allaqachon mavjud!");

    const newGroup = {
      id: "grp-" + Date.now(),
      name: cleanName,
      faculty: data.faculty?.trim() || null,
      description: data.description?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.groups.push(newGroup);
    writeLocalStore(store);
    return newGroup;
  },

  async updateGroup(id: string, data: { name?: string; faculty?: string; description?: string }) {
    const store = readLocalStore();
    let oldName = "";

    if (await checkPostgres()) {
      const current = await (prisma as any).group.findUnique({ where: { id } });
      if (!current) throw new Error("Guruh topilmadi");
      oldName = current.name;

      const cleanName = data.name ? data.name.trim() : oldName;
      if (cleanName.toLowerCase() !== oldName.toLowerCase()) {
        const existing = await (prisma as any).group.findFirst({
          where: { name: { equals: cleanName }, id: { not: id } },
        });
        if (existing) throw new Error("Bu nomdagi guruh allaqachon mavjud");
      }

      const updated = await (prisma as any).group.update({
        where: { id },
        data: {
          name: cleanName,
          faculty: data.faculty !== undefined ? data.faculty?.trim() || null : current.faculty,
          description: data.description !== undefined ? data.description?.trim() || null : current.description,
        },
      });

      if (cleanName !== oldName) {
        await prisma.user.updateMany({
          where: { groupName: oldName },
          data: { groupName: cleanName },
        });
      }

      return updated;
    }

    const idx = (store.groups || []).findIndex((g: any) => g.id === id);
    if (idx === -1) throw new Error("Guruh topilmadi");
    oldName = store.groups[idx].name;

    const cleanName = data.name ? data.name.trim() : oldName;
    if (cleanName.toLowerCase() !== oldName.toLowerCase()) {
      const existing = (store.groups || []).find(
        (g: any) => g.name.toLowerCase() === cleanName.toLowerCase() && g.id !== id
      );
      if (existing) throw new Error("Bu nomdagi guruh allaqachon mavjud");
    }

    store.groups[idx] = {
      ...store.groups[idx],
      name: cleanName,
      faculty: data.faculty !== undefined ? data.faculty?.trim() || null : store.groups[idx].faculty,
      description: data.description !== undefined ? data.description?.trim() || null : store.groups[idx].description,
      updatedAt: new Date().toISOString(),
    };

    if (cleanName !== oldName) {
      store.users.forEach((u: any) => {
        if (u.groupName === oldName) u.groupName = cleanName;
      });
      store.tests.forEach((t: any) => {
        if (t.allowedGroups && Array.isArray(t.allowedGroups)) {
          t.allowedGroups = t.allowedGroups.map((g: string) => (g === oldName ? cleanName : g));
        }
      });
    }

    writeLocalStore(store);
    return store.groups[idx];
  },

  async deleteGroup(id: string) {
    if (await checkPostgres()) {
      try {
        const group = await (prisma as any).group.findUnique({ where: { id } });
        if (group) {
          await (prisma as any).group.delete({ where: { id } }).catch(console.warn);
        }
      } catch (err) {
        console.error("deleteGroup postgres error:", err);
      }
    }

    const store = readLocalStore();
    const group = (store.groups || []).find((g: any) => g.id === id);
    if (group) {
      const gName = group.name;
      store.groups = store.groups.filter((g: any) => g.id !== id);
      store.tests.forEach((t: any) => {
        if (t.allowedGroups && Array.isArray(t.allowedGroups)) {
          t.allowedGroups = t.allowedGroups.filter((name: string) => name !== gName);
        }
      });
      if (!store.deletedIds) store.deletedIds = [];
      if (!store.deletedIds.includes(id)) store.deletedIds.push(id);
      writeLocalStore(store);
    }
    return true;
  },

  // Talabalarni guruhga biriktirish
  async assignStudentsToGroup(groupName: string, studentIds: string[]) {
    if (await checkPostgres()) {
      await prisma.user.updateMany({
        where: { id: { in: studentIds } },
        data: { groupName: groupName.trim() },
      });
      return true;
    }

    const store = readLocalStore();
    store.users.forEach((u: any) => {
      if (studentIds.includes(u.id)) {
        u.groupName = groupName.trim();
      }
    });
    writeLocalStore(store);
    return true;
  },

  // Talabani guruhdan chiqarish
  async removeStudentFromGroup(studentId: string) {
    if (await checkPostgres()) {
      await prisma.user.update({
        where: { id: studentId },
        data: { groupName: null },
      });
      return true;
    }

    const store = readLocalStore();
    const user = store.users.find((u: any) => u.id === studentId);
    if (user) {
      user.groupName = null;
      writeLocalStore(store);
    }
    return true;
  },

  // Guruhga testlarni biriktirish (Testlarning allowedGroups qatoriga qo'shish yoki olib tashlash)
  async assignTestsToGroup(groupName: string, assignedTestIds: string[]) {
    const gName = groupName.trim();

    if (await checkPostgres()) {
      const allTests = await (prisma.test as any).findMany();
      for (const t of allTests) {
        let currentGroups = parseAllowedGroups(t.allowedGroups);
        const shouldHave = assignedTestIds.includes(t.id);
        const has = currentGroups.some((g: string) => g.toLowerCase() === gName.toLowerCase());

        if (shouldHave && !has) {
          currentGroups.push(gName);
          await (prisma.test as any).update({
            where: { id: t.id },
            data: { allowedGroups: JSON.stringify(currentGroups) },
          });
        } else if (!shouldHave && has) {
          currentGroups = currentGroups.filter((g: string) => g.toLowerCase() !== gName.toLowerCase());
          await (prisma.test as any).update({
            where: { id: t.id },
            data: { allowedGroups: currentGroups.length > 0 ? JSON.stringify(currentGroups) : null },
          });
        }
      }
      return true;
    }

    const store = readLocalStore();
    store.tests.forEach((t: any) => {
      let currentGroups = parseAllowedGroups(t.allowedGroups);
      const shouldHave = assignedTestIds.includes(t.id);
      const has = currentGroups.some((g: string) => g.toLowerCase() === gName.toLowerCase());

      if (shouldHave && !has) {
        currentGroups.push(gName);
        t.allowedGroups = currentGroups;
      } else if (!shouldHave && has) {
        currentGroups = currentGroups.filter((g: string) => g.toLowerCase() !== gName.toLowerCase());
        t.allowedGroups = currentGroups;
      }
    });
    writeLocalStore(store);
    return true;
  },

  // Talabaning testga dostupini tekshirish
  async isStudentAllowedForTest(testId: string, studentGroupName?: string | null): Promise<{
    allowed: boolean;
    reason?: string;
    allowedGroups: string[];
    testTitle?: string;
  }> {
    let allowedGroups: string[] = [];
    let title = "";

    if (await checkPostgres()) {
      const test = await (prisma.test as any).findUnique({
        where: { id: testId },
        select: { title: true, allowedGroups: true },
      });
      if (!test) return { allowed: false, reason: "Test topilmadi", allowedGroups: [] };
      allowedGroups = parseAllowedGroups(test.allowedGroups);
      title = test.title;
    } else {
      const store = readLocalStore();
      const test = store.tests.find((t: any) => t.id === testId);
      if (!test) return { allowed: false, reason: "Test topilmadi", allowedGroups: [] };
      allowedGroups = parseAllowedGroups(test.allowedGroups);
      title = test.title;
    }

    // Agar hech qanday guruh belgilanmagan bo'lsa -> test hamma uchun ochiq
    if (allowedGroups.length === 0) {
      return { allowed: true, allowedGroups: [], testTitle: title };
    }

    // Agar aniq guruhlar belgilangan bo'lsa, talaba guruhi tekshiriladi
    if (!studentGroupName || !studentGroupName.trim()) {
      return {
        allowed: false,
        reason: "Ushbu test faqat belgilangan guruhlar uchun ochiq! Tizimga o'z guruhingiz bilan kiring.",
        allowedGroups,
        testTitle: title,
      };
    }

    const cleanStudentGroup = studentGroupName.trim().toLowerCase();
    const isMatched = allowedGroups.some((g) => g.trim().toLowerCase() === cleanStudentGroup);

    if (isMatched) {
      return { allowed: true, allowedGroups, testTitle: title };
    }

    return {
      allowed: false,
      reason: `Sizning guruhingiz (${studentGroupName}) ushbu testga ruxsat etilmagan. Ruxsat berilgan guruhlar: ${allowedGroups.join(", ")}`,
      allowedGroups,
      testTitle: title,
    };
  },
};
