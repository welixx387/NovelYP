import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { novelCardInclude, toNovelCardData } from "@/lib/novel-mapper";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const genre = searchParams.get("genre");
    const status = searchParams.get("status");
    const year = searchParams.get("year");
    const sort = searchParams.get("sort") ?? "popular";
    const limit = Math.min(Number(searchParams.get("limit")) || 24, 60);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const where: Prisma.NovelWhereInput = {
      ...(search && {
        OR: [{ title: { contains: search } }, { author: { contains: search } }],
      }),
      ...(status && { status }),
      ...(year && { year: Number(year) }),
      ...(genre && { genres: { some: { slug: genre } } }),
    };

    const include = novelCardInclude;

    // Сортировку по среднему рейтингу нельзя выразить через orderBy на уровне БД
    // (рейтинг хранится как сумма+количество), поэтому считаем и сортируем в памяти.
    if (sort === "rating") {
      const all = await prisma.novel.findMany({ where, include, take: 500 });
      const sorted = all.sort((a, b) => {
        const avgA = a.ratingCount ? a.ratingSum / a.ratingCount : 0;
        const avgB = b.ratingCount ? b.ratingSum / b.ratingCount : 0;
        return avgB - avgA;
      });
      const items = sorted.slice((page - 1) * limit, (page - 1) * limit + limit).map(toNovelCardData);
      return NextResponse.json({ items, total: sorted.length, page, pageSize: limit });
    }

    const orderBy: Prisma.NovelOrderByWithRelationInput =
      sort === "new"
        ? { createdAt: "desc" }
        : sort === "title"
          ? { title: "asc" }
          : { viewCount: "desc" }; // popular (по умолчанию)

    const [novels, total] = await Promise.all([
      prisma.novel.findMany({
        where,
        orderBy,
        include,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.novel.count({ where }),
    ]);

    return NextResponse.json({ items: novels.map(toNovelCardData), total, page, pageSize: limit });
  } catch (error) {
    return handleApiError(error);
  }
}
