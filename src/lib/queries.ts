import "server-only";
import { prisma } from "@/lib/prisma";
import { novelCardInclude, toNovelCardData } from "@/lib/novel-mapper";
import type { ContinueReadingItem, NovelCardData } from "@/types";

// Серверные выборки для лендинга и других RSC — обращаются к Prisma напрямую,
// без похода через собственный HTTP API (он нужен только клиентским компонентам).

export async function getPopularNovels(limit = 12): Promise<NovelCardData[]> {
  const novels = await prisma.novel.findMany({
    orderBy: { viewCount: "desc" },
    include: novelCardInclude,
    take: limit,
  });
  return novels.map(toNovelCardData);
}

export async function getTopRatedNovels(limit = 8): Promise<NovelCardData[]> {
  const novels = await prisma.novel.findMany({
    where: { ratingCount: { gt: 0 } },
    include: novelCardInclude,
    take: 200,
  });
  return novels
    .sort((a, b) => b.ratingSum / b.ratingCount - a.ratingSum / a.ratingCount)
    .slice(0, limit)
    .map(toNovelCardData);
}

// Новеллы с недавно вышедшими главами, отсортированные по дате этой главы (без повторов).
export async function getRecentlyUpdatedNovels(limit = 12): Promise<NovelCardData[]> {
  const chapters = await prisma.chapter.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit * 4,
    include: { novel: { include: novelCardInclude } },
  });

  const seen = new Set<string>();
  const items: NovelCardData[] = [];
  for (const chapter of chapters) {
    if (seen.has(chapter.novelId)) continue;
    seen.add(chapter.novelId);
    items.push(toNovelCardData(chapter.novel));
    if (items.length >= limit) break;
  }
  return items;
}

export async function getGenresWithCounts() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { novels: true } } },
  });
  return genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug, count: g._count.novels }));
}

export async function getNovelDetail(slug: string, userId?: string) {
  const novel = await prisma.novel.findUnique({
    where: { slug },
    include: {
      genres: true,
      chapters: {
        orderBy: { number: "asc" },
        select: { id: true, number: true, title: true, isPremium: true, publishedAt: true },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });

  if (!novel) return null;

  const [isBookmarked, progress] = userId
    ? await Promise.all([
        prisma.bookmark.findUnique({ where: { userId_novelId: { userId, novelId: novel.id } } }),
        prisma.readingProgress.findUnique({ where: { userId_novelId: { userId, novelId: novel.id } } }),
      ])
    : [null, null];

  return {
    id: novel.id,
    slug: novel.slug,
    title: novel.title,
    description: novel.description,
    coverUrl: novel.coverUrl,
    author: novel.author,
    status: novel.status,
    year: novel.year,
    rating: novel.ratingCount ? Math.round((novel.ratingSum / novel.ratingCount) * 10) / 10 : 0,
    ratingCount: novel.ratingCount,
    viewCount: novel.viewCount,
    genres: novel.genres.map((g) => ({ slug: g.slug, name: g.name })),
    chapters: novel.chapters.map((c) => ({
      ...c,
      publishedAt: c.publishedAt.toISOString(),
    })),
    reviews: novel.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    isBookmarked: Boolean(isBookmarked),
    myReviewId: novel.reviews.find((r) => r.userId === userId)?.id ?? null,
    continueChapterNumber: progress?.chapterNumber ?? null,
  };
}

export async function getChapterForReader(novelSlug: string, chapterNumber: number, userId?: string) {
  const novel = await prisma.novel.findUnique({
    where: { slug: novelSlug },
    include: {
      chapters: {
        orderBy: { number: "asc" },
        select: { id: true, number: true, title: true, isPremium: true },
      },
    },
  });
  if (!novel) return null;

  const chapter = novel.chapters.find((c) => c.number === chapterNumber);
  if (!chapter) return null;

  const [full, comments, progress] = await Promise.all([
    prisma.chapter.findUnique({ where: { id: chapter.id } }),
    prisma.comment.findMany({
      where: { chapterId: chapter.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    userId
      ? prisma.readingProgress.findUnique({ where: { userId_novelId: { userId, novelId: novel.id } } })
      : null,
  ]);
  if (!full) return null;

  const index = novel.chapters.findIndex((c) => c.id === chapter.id);

  return {
    novel: { id: novel.id, slug: novel.slug, title: novel.title },
    chapters: novel.chapters,
    chapter: { id: full.id, number: full.number, title: full.title, content: full.content, isPremium: full.isPremium },
    prevChapterNumber: novel.chapters[index - 1]?.number ?? null,
    nextChapterNumber: novel.chapters[index + 1]?.number ?? null,
    comments: comments.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    })),
    initialScrollPercent: progress && progress.chapterId === chapter.id ? progress.scrollPercent : 0,
  };
}

export async function getBookmarkedNovels(userId: string): Promise<NovelCardData[]> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { novel: { include: novelCardInclude } },
  });
  return bookmarks.map((b) => toNovelCardData(b.novel));
}

export async function getReadingHistory(userId: string): Promise<ContinueReadingItem[]> {
  const progress = await prisma.readingProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { novel: true },
  });

  return progress.map((p) => ({
    novelSlug: p.novel.slug,
    novelTitle: p.novel.title,
    coverUrl: p.novel.coverUrl,
    chapterNumber: p.chapterNumber,
    chapterId: p.chapterId,
    scrollPercent: p.scrollPercent,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getContinueReading(userId: string, limit = 6): Promise<ContinueReadingItem[]> {
  const progress = await prisma.readingProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { novel: true },
  });

  return progress.map((p) => ({
    novelSlug: p.novel.slug,
    novelTitle: p.novel.title,
    coverUrl: p.novel.coverUrl,
    chapterNumber: p.chapterNumber,
    chapterId: p.chapterId,
    scrollPercent: p.scrollPercent,
    updatedAt: p.updatedAt.toISOString(),
  }));
}
