import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/types";

// Edge-совместимый модуль: используется и в middleware (Edge runtime), и на сервере.
// Здесь нет импорта Prisma — нативный клиент Prisma не работает в Edge runtime.

export const SESSION_COOKIE = "session";

export interface SessionPayload {
  sub: string; // userId
  role: Role;
}

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET не задан в переменных окружения");
  }
  return new TextEncoder().encode(secret);
}

function parseDurationToSeconds(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) return 60 * 60 * 24 * 30; // fallback: 30 дней
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

export function getSessionMaxAgeSeconds(): number {
  return parseDurationToSeconds(process.env.JWT_EXPIRES_IN ?? "30d");
}

// httpOnly — недоступна из JS (защита от XSS-кражи токена), sameSite=lax — куки не улетают
// при переходах с чужих сайтов (CSRF), secure включаем вне разработки (нужен HTTPS).
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  };
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "30d";
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return { sub: payload.sub, role: payload.role as Role };
  } catch {
    return null;
  }
}
