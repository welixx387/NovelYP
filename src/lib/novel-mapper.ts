import "server-only";
import type { NovelCardData, NovelStatus } from "@/types";

interface NovelForCard {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  author: string;
  status: string;
  year: number;
  ratingSum: number;
  ratingCount: number;
  genres: { name: string }[];
  _count: { chapters: number };
  chapters: { publishedAt: Date }[];
}

export const novelCardInclude = {
  genres: true,
  _count: { select: { chapters: true } },
  chapters: {
    select: { publishedAt: true },
    orderBy: { number: "desc" as const },
    take: 1,
  },
};

export function toNovelCardData(novel: NovelForCard): NovelCardData {
  return {
    id: novel.id,
    slug: novel.slug,
    title: novel.title,
    coverUrl: novel.coverUrl,
    author: novel.author,
    status: novel.status as NovelStatus,
    year: novel.year,
    rating: novel.ratingCount ? Math.round((novel.ratingSum / novel.ratingCount) * 10) / 10 : 0,
    ratingCount: novel.ratingCount,
    genres: novel.genres.map((g) => g.name),
    chaptersCount: novel._count.chapters,
    lastChapterAt: novel.chapters[0]?.publishedAt.toISOString() ?? null,
  };
}
