import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const user = await requireSessionUser();
    const novel = await prisma.novel.findUnique({ where: { slug: params.slug } });
    if (!novel) throw new ApiError("Ранобэ не найдено", 404);

    const existing = await prisma.bookmark.findUnique({
      where: { userId_novelId: { userId: user.id, novelId: novel.id } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.bookmark.create({ data: { userId: user.id, novelId: novel.id } });
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    return handleApiError(error);
  }
}
