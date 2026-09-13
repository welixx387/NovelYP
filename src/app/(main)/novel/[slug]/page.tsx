import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Calendar, User } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getNovelDetail } from "@/lib/queries";
import { hasActiveSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/novel/star-rating";
import { NovelCover } from "@/components/novel/novel-cover";
import { ChapterList } from "@/components/novel/chapter-list";
import { ReviewSection } from "@/components/novel/review-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompactNumber } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  ONGOING: "Онгоинг",
  COMPLETED: "Завершён",
  HIATUS: "Пауза",
};

async function loadNovel(slug: string, userId?: string) {
  const novel = await getNovelDetail(slug, userId);
  if (!novel) return null;

  // Счётчик просмотров — не блокирует рендер страницы.
  await prisma.novel.update({ where: { id: novel.id }, data: { viewCount: { increment: 1 } } });

  return novel;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const novel = await getNovelDetail(params.slug);
  if (!novel) return {};

  return {
    title: novel.title,
    description: novel.description.slice(0, 160),
    openGraph: {
      title: novel.title,
      description: novel.description.slice(0, 160),
      images: [{ url: novel.coverUrl }],
    },
  };
}

export default async function NovelPage({ params }: { params: { slug: string } }) {
  const user = await getSessionUser();
  const novel = await loadNovel(params.slug, user?.id);
  if (!novel) notFound();

  const canReadPremium = user ? await hasActiveSubscription(user.id) : false;
  const firstChapterNumber = novel.chapters[0]?.number ?? 1;
  const readHref = `/reader/${novel.slug}/${novel.continueChapterNumber ?? firstChapterNumber}`;

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <NovelCover
            slug={novel.slug}
            title={novel.title}
            coverUrl={novel.coverUrl}
            initialBookmarked={novel.isBookmarked}
          />
          <Button size="lg" className="w-full max-w-[260px]" asChild>
            <Link href={readHref}>
              <BookOpen className="h-4 w-4" />
              {novel.continueChapterNumber ? "Продолжить чтение" : "Читать"}
            </Link>
          </Button>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={novel.status === "COMPLETED" ? "success" : "default"}>
              {STATUS_LABELS[novel.status]}
            </Badge>
            {novel.genres.map((genre) => (
              <Link key={genre.slug} href={`/catalog?genre=${genre.slug}`}>
                <Badge variant="outline">{genre.name}</Badge>
              </Link>
            ))}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{novel.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {novel.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {novel.year}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> {novel.chapters.length} глав
            </span>
            <span>{formatCompactNumber(novel.viewCount)} просмотров</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <StarRating value={Math.round(novel.rating)} />
            <span className="text-lg font-semibold">{novel.rating || "—"}</span>
            <span className="text-sm text-muted-foreground">({novel.ratingCount} оценок)</span>
          </div>

          <p className="mt-6 max-w-3xl whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {novel.description}
          </p>

          <Tabs defaultValue="chapters" className="mt-8">
            <TabsList>
              <TabsTrigger value="chapters">Главы</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы ({novel.reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="chapters">
              <ChapterList
                novelSlug={novel.slug}
                chapters={novel.chapters}
                hasActiveSubscription={canReadPremium}
                continueChapterNumber={novel.continueChapterNumber}
              />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewSection
                novelSlug={novel.slug}
                initialReviews={novel.reviews}
                hasReviewed={Boolean(novel.myReviewId)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
