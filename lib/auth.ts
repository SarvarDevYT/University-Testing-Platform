import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "univer-platform-fallback-secret-2026-univer";
const TOKEN_NAME = "univer_auth_token";

export interface AuthUserPayload {
  id: string;
  username: string;
  fullName: string;
  role: "ADMIN" | "STUDENT";
  groupName?: string | null;
  faculty?: string | null;
}

// Parolni bcrypt bilan xeshlash (10 rounds)
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Parolni tekshirish
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// JWT yaratish
export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

// JWT tekshirish
export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

// Server Component / API Route uchun hozirgi tizimga kirgan foydalanuvchi
export async function getCurrentUser(): Promise<AuthUserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export { TOKEN_NAME };
