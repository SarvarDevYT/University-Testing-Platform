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

export interface TestDTO {
  id: string;
  title: string;
  description: string | null;
  category: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  accessCode: string;
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
  tests: any[];
  questions: any[];
  results: any[];
  deletedIds?: string[];
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

    // O'chirilgan ID larni to'liq tozalash
    parsed.tests = (parsed.tests || []).filter((t: any) => !parsed.deletedIds?.includes(t.id));
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

// Baza turini tekshirish (Prisma / Postgres mavjudmi?)
let isPostgresHealthy: boolean | null = null;

async function checkPostgres(): Promise<boolean> {
  if (isPostgresHealthy !== null) return isPostgresHealthy;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("npg_placeholder") || !dbUrl.startsWith("postgres")) {
    isPostgresHealthy = false;
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPostgresHealthy = true;
    return true;
  } catch {
    isPostgresHealthy = false;
    return false;
  }
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

    if (await checkPostgres()) {
      return await prisma.user.create({
        data: {
          fullName: data.fullName,
          username: data.username,
          password: hashedPassword,
          role: "STUDENT",
          faculty: data.faculty || null,
          groupName: data.groupName || null,
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
      faculty: data.faculty || null,
      groupName: data.groupName || null,
      phone: data.phone || null,
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    writeLocalStore(store);
    return newUser;
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
      return await prisma.test.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { questions: true, results: true },
          },
        },
      });
    }

    const store = readLocalStore();
    let list = store.tests;
    if (onlyActive) {
      list = list.filter((t) => t.isActive);
    }

    return list.map((t) => ({
      ...t,
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
      const test = await prisma.test.findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
      if (!test) return null;
      if (!includeAnswers) {
        test.questions = test.questions.map((q) => ({
          ...q,
          correctAnswer: "", // Talabaga to'g'ri javobni ko'rsatmaslik!
        }));
      }
      return test;
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

    return { ...test, questions, createdAt: new Date(test.createdAt) };
  },

  // Testni Ommaviy havola (accessCode) orqali olish
  async getTestByAccessCode(accessCode: string) {
    if (await checkPostgres()) {
      const test = await prisma.test.findUnique({
        where: { accessCode },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
      if (!test || !test.isActive) return null;
      test.questions = test.questions.map((q) => ({
        ...q,
        correctAnswer: "", // xavfsizlik: to'g'ri javob yashiriladi
      }));
      return test;
    }

    const store = readLocalStore();
    const test = store.tests.find((t) => t.accessCode === accessCode && t.isActive);
    if (!test) return null;

    const questions = store.questions
      .filter((q) => q.testId === test.id)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((q) => ({ ...q, correctAnswer: "" }));

    return { ...test, questions, createdAt: new Date(test.createdAt) };
  },

  // Yangi test yaratish
  async createTest(data: {
    title: string;
    description?: string;
    category: string;
    timeLimit: number;
    passingScore: number;
    isActive?: boolean;
  }) {
    const accessCode = "test-" + Math.random().toString(36).substring(2, 8);

    if (await checkPostgres()) {
      return await prisma.test.create({
        data: {
          title: data.title,
          description: data.description || null,
          category: data.category || "Umumiy",
          timeLimit: data.timeLimit || 20,
          passingScore: data.passingScore || 60,
          isActive: data.isActive !== undefined ? data.isActive : true,
          accessCode,
        },
      });
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
      createdAt: new Date().toISOString(),
    };
    store.tests.push(newTest);
    writeLocalStore(store);
    return newTest;
  },

  // Testni yangilash
  async updateTest(id: string, data: Partial<TestDTO>) {
    if (await checkPostgres()) {
      return await prisma.test.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          isActive: data.isActive,
        },
      });
    }

    const store = readLocalStore();
    const index = store.tests.findIndex((t) => t.id === id);
    if (index !== -1) {
      store.tests[index] = { ...store.tests[index], ...data };
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
};
