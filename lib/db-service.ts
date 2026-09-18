import prisma from "./prisma";
import { hashPassword } from "./auth";
import fs from "fs";
import path from "path";

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

interface StoreData {
  users: any[];
  tests: any[];
  questions: any[];
  results: any[];
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
      {
        id: "student-1",
        username: "talaba2026",
        password: "$2b$10$.WHeHuVNw6X3R0tH.FzRQehbf6asiLfpJvYvbiFJditSNB92lAM/q", // admin123
        fullName: "Aliyev Jasur Anvar o'g'li",
        role: "STUDENT",
        faculty: "Axborot texnologiyalari",
        groupName: "AT-21",
        phone: "+998 93 555 44 33",
        createdAt: new Date().toISOString(),
      },
    ],
    tests: [
      {
        id: "test-demo-1",
        title: "Dasturlash va Algoritmlash Asoslari",
        description: "Talabalarning mantiqiy fikrlashi, algoritmlar va dasturlash asoslari bo'yicha dastlabki bilimlarini baholash testi.",
        category: "Axborot Texnologiyalari",
        timeLimit: 15,
        passingScore: 60,
        isActive: true,
        accessCode: "algo-2026",
        createdAt: new Date().toISOString(),
      },
      {
        id: "test-demo-2",
        title: "Oliy Matematika va Chiziqli Algebra",
        description: "Matritsalar, determinantlar va ehtimollar nazariyasi bo'yicha universitet oraliq nazorat testi.",
        category: "Matematika",
        timeLimit: 20,
        passingScore: 65,
        isActive: true,
        accessCode: "math-2026",
        createdAt: new Date().toISOString(),
      },
      {
        id: "test-demo-3",
        title: "Psixodiagnostika va Shaxsiyat Tahlili",
        description: "Talabalarning stressga chidamliligi, emotsional intellekti va kasbiy moyilligini ilmiy baholash.",
        category: "Psixologiya & HR",
        timeLimit: 10,
        passingScore: 50,
        isActive: true,
        accessCode: "psy-2026",
        createdAt: new Date().toISOString(),
      },
    ],
    questions: [
      {
        id: "q-1-1",
        testId: "test-demo-1",
        questionText: "Vaqt murakkabligi O(1) bo'lgan amaliyot qaysi biri hisoblanadi?",
        points: 1,
        optionA: "Massiv elementiga indeks orqali murojaat qilish",
        optionB: "Bog'langan ro'yxatdan element qidirish",
        optionC: "Binary search daraxtida qidirish",
        optionD: "Massivni tartiblash (QuickSort)",
        correctAnswer: "A",
        orderIndex: 0,
      },
      {
        id: "q-1-2",
        testId: "test-demo-1",
        questionText: "FIFO (First In, First Out) tamoyili qaysi ma'lumotlar tuzilmasiga xos?",
        points: 1,
        optionA: "Stack (Stek)",
        optionB: "Queue (Navbat)",
        optionC: "Binary Tree",
        optionD: "Hash Table",
        correctAnswer: "B",
        orderIndex: 1,
      },
      {
        id: "q-1-3",
        testId: "test-demo-1",
        questionText: "HTTP 404 xatosi nimani anglatadi?",
        points: 1,
        optionA: "Server ichki xatosi",
        optionB: "Resurs topilmadi (Not Found)",
        optionC: "Muvaffaqiyatli bajarildi",
        optionD: "Ruxsat etilmagan (Forbidden)",
        correctAnswer: "B",
        orderIndex: 2,
      },
      {
        id: "q-2-1",
        testId: "test-demo-2",
        questionText: "Agar matritsaning determinanti 0 ga teng bo'lsa, bu nima degani?",
        points: 1,
        optionA: "Teskari matritsa mavjud emas (Maxsus matritsa)",
        optionB: "Birlik matritsa",
        optionC: "Matritsa faqat musbat sonlardan iborat",
        optionD: "Teskari matritsa aynan o'ziga teng",
        correctAnswer: "A",
        orderIndex: 0,
      },
      {
        id: "q-3-1",
        testId: "test-demo-3",
        questionText: "Emotsional intellekt (EQ) tushunchasining asosiy komponenti qaysi?",
        points: 1,
        optionA: "O'z his-tuyg'ularini anglash va boshqara olish",
        optionB: "Faqat mantiqiy masalalarni yechish tezligi",
        optionC: "Xotira hajmining kattaligi",
        optionD: "Chet tillarini tez o'zlashtirish",
        correctAnswer: "A",
        orderIndex: 0,
      },
    ],
    results: [],
  };
}

function readLocalStore(): StoreData {
  try {
    if (!fs.existsSync(LOCAL_DATA_FILE)) {
      const initial = getInitialStore();
      const dir = path.dirname(LOCAL_DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return getInitialStore();
  }
}

function writeLocalStore(data: StoreData) {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local store write error:", err);
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
      return await prisma.user.findUnique({
        where: { username },
      });
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

  // Talabani o'chirish
  async deleteStudent(userId: string) {
    if (await checkPostgres()) {
      return await prisma.user.delete({
        where: { id: userId },
      });
    }
    const store = readLocalStore();
    store.users = store.users.filter((u) => u.id !== userId);
    store.results = store.results.filter((r) => r.userId !== userId);
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

  // Testni o'chirish
  async deleteTest(id: string) {
    if (await checkPostgres()) {
      return await prisma.test.delete({
        where: { id },
      });
    }

    const store = readLocalStore();
    store.tests = store.tests.filter((t) => t.id !== id);
    store.questions = store.questions.filter((q) => q.testId !== id);
    store.results = store.results.filter((r) => r.testId !== id);
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
      return await prisma.question.delete({ where: { id } });
    }
    const store = readLocalStore();
    store.questions = store.questions.filter((q) => q.id !== id);
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
