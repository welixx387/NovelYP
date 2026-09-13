import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validations";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.comment.findMany({
      where: { chapterId: params.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireSessionUser();
    const { text } = commentSchema.parse(await request.json());

    const chapter = await prisma.chapter.findUnique({ where: { id: params.id } });
    if (!chapter) throw new ApiError("Глава не найдена", 404);

    const comment = await prisma.comment.create({
      data: { chapterId: chapter.id, userId: user.id, text },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
