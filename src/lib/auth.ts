import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";
import type { SessionUser } from "@/types";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Читает и проверяет JWT из httpOnly cookie, подтягивает свежие данные пользователя из БД.
// Возвращает null, если сессии нет / она истекла / пользователь удалён.
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser["role"],
    avatarUrl: user.avatarUrl,
  };
}

// Для токенов сброса пароля: пользователю уходит raw-токен по email, а в БД хранится
// только его хэш — как и с паролями, чтобы утечка базы не давала прав сброса чужих паролей.
export function generateRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class UnauthorizedError extends Error {
  constructor(message = "Требуется авторизация") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// Для API-роутов, где неавторизованный доступ должен прерывать обработку ошибкой 401.
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
