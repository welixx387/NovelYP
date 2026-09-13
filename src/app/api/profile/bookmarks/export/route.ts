import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: { novel: { select: { slug: true, title: true } } },
    });

    return NextResponse.json(bookmarks.map((b) => b.novel.slug));
  } catch (error) {
    return handleApiError(error);
  }
}
