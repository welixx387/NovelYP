import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

const importSchema = z.object({ slugs: z.array(z.string()).max(500) });

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { slugs } = importSchema.parse(await request.json());

    const novels = await prisma.novel.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });

    const existing = await prisma.bookmark.findMany({
      where: { userId: user.id, novelId: { in: novels.map((n) => n.id) } },
      select: { novelId: true },
    });
    const existingIds = new Set(existing.map((b) => b.novelId));
    const toCreate = novels.filter((n) => !existingIds.has(n.id));

    if (toCreate.length > 0) {
      await prisma.bookmark.createMany({
        data: toCreate.map((n) => ({ userId: user.id, novelId: n.id })),
      });
    }

    return NextResponse.json({ added: toCreate.length });
  } catch (error) {
    return handleApiError(error);
  }
}
