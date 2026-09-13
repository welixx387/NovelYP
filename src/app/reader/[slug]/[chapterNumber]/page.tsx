import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getChapterForReader } from "@/lib/queries";
import { hasActiveSubscription } from "@/lib/subscription";
import { ReaderView } from "@/components/reader/reader-view";
import { PremiumGate } from "@/components/reader/premium-gate";

interface PageProps {
  params: { slug: string; chapterNumber: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const chapterNumber = Number(params.chapterNumber);
  if (!Number.isInteger(chapterNumber)) return {};

  const data = await getChapterForReader(params.slug, chapterNumber);
  if (!data) return {};

  return { title: `Глава ${data.chapter.number} — ${data.novel.title}` };
}

export default async function ReaderPage({ params }: PageProps) {
  const chapterNumber = Number(params.chapterNumber);
  if (!Number.isInteger(chapterNumber)) notFound();

  const user = await getSessionUser();
  const data = await getChapterForReader(params.slug, chapterNumber, user?.id);
  if (!data) notFound();

  const canAccess = !data.chapter.isPremium || (user ? await hasActiveSubscription(user.id) : false);

  if (!canAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <PremiumGate
          novelSlug={data.novel.slug}
          chapterTitle={data.chapter.title}
          isLoggedIn={Boolean(user)}
        />
      </div>
    );
  }

  return (
    <ReaderView
      key={data.chapter.id}
      novel={data.novel}
      chapter={data.chapter}
      chapters={data.chapters}
      prevChapterNumber={data.prevChapterNumber}
      nextChapterNumber={data.nextChapterNumber}
      comments={data.comments}
      initialScrollPercent={data.initialScrollPercent}
      isLoggedIn={Boolean(user)}
    />
  );
}
