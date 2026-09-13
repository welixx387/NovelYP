import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { signSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/jwt";
import { loginSchema } from "@/lib/validations";
import { handleApiError, ApiError } from "@/lib/api-error";
import type { SessionUser } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordValid = user ? await verifyPassword(password, user.passwordHash) : false;

    // Намеренно один и тот же ответ для "нет такого email" и "неверный пароль" —
    // иначе форма логина превращается в способ проверить, зарегистрирован ли email.
    if (!user || !passwordValid) {
      throw new ApiError("Неверный email или пароль", 401, {
        root: "Неверный email или пароль",
      });
    }

    const token = await signSessionToken({ sub: user.id, role: user.role as SessionUser["role"] });

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionUser["role"],
      avatarUrl: user.avatarUrl,
    };

    const response = NextResponse.json(sessionUser);
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
