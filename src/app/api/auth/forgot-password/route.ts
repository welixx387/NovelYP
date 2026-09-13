import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRawToken, hashToken } from "@/lib/auth";
import { sendEmail, renderResetPasswordEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 час

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Не сообщаем, существует ли email — иначе форма превращается в оракул для перебора почт.
    if (user) {
      const rawToken = generateRawToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;
      await sendEmail({
        to: user.email,
        subject: "Восстановление пароля — NovelYP",
        html: renderResetPasswordEmail(resetUrl),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
