import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { signSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/jwt";
import { registerSchema } from "@/lib/validations";
import { handleApiError, ApiError } from "@/lib/api-error";
import type { SessionUser } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError("Пользователь с таким email уже зарегистрирован", 409, {
        email: "Этот email уже занят",
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        subscription: { create: { status: "NONE" } },
      },
    });

    const token = await signSessionToken({ sub: user.id, role: user.role as SessionUser["role"] });

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionUser["role"],
      avatarUrl: user.avatarUrl,
    };

    const response = NextResponse.json(sessionUser, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
