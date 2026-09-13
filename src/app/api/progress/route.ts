import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

const progressSchema = z.object({
  novelId: z.string().min(1),
  chapterId: z.string().min(1),
  chapterNumber: z.number().int().positive(),
  scrollPercent: z.number().min(0).max(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { novelId, chapterId, chapterNumber, scrollPercent } = progressSchema.parse(
      await request.json()
    );

    await prisma.readingProgress.upsert({
      where: { userId_novelId: { userId: user.id, novelId } },
      create: { userId: user.id, novelId, chapterId, chapterNumber, scrollPercent },
      update: { chapterId, chapterNumber, scrollPercent },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
