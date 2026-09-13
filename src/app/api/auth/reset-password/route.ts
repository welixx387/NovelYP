import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashToken } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!resetToken || resetToken.expiresAt.getTime() < Date.now()) {
      throw new ApiError("Ссылка недействительна или уже устарела", 400, {
        root: "Ссылка недействительна или уже устарела",
      });
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      // Токены сброса одноразовые: удаляем использованный и все прочие, выданные ранее.
      prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
