import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const { rating, text } = reviewSchema.parse(body);

    const novel = await prisma.novel.findUnique({ where: { slug: params.slug } });
    if (!novel) throw new ApiError("Ранобэ не найдено", 404);

    const existing = await prisma.review.findUnique({
      where: { novelId_userId: { novelId: novel.id, userId: user.id } },
    });
    if (existing) {
      throw new ApiError("Вы уже оставляли отзыв на это ранобэ", 409);
    }

    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: { novelId: novel.id, userId: user.id, rating, text },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.novel.update({
        where: { id: novel.id },
        data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
