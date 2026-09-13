import Link from "next/link";
import { ArrowLeft, ArrowRight, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChapterNav({
  novelSlug,
  prevChapterNumber,
  nextChapterNumber,
}: {
  novelSlug: string;
  prevChapterNumber: number | null;
  nextChapterNumber: number | null;
}) {
  return (
    <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 pb-16">
      <Button variant="outline" disabled={!prevChapterNumber} asChild={!!prevChapterNumber}>
        {prevChapterNumber ? (
          <Link href={`/reader/${novelSlug}/${prevChapterNumber}`}>
            <ArrowLeft className="h-4 w-4" /> Предыдущая
          </Link>
        ) : (
          <span>
            <ArrowLeft className="h-4 w-4" /> Предыдущая
          </span>
        )}
      </Button>

      <Button variant="ghost" size="icon" asChild>
        <Link href={`/novel/${novelSlug}`} aria-label="Список глав">
          <ListOrdered className="h-4 w-4" />
        </Link>
      </Button>

      <Button disabled={!nextChapterNumber} asChild={!!nextChapterNumber}>
        {nextChapterNumber ? (
          <Link href={`/reader/${novelSlug}/${nextChapterNumber}`}>
            Следующая <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            Следующая <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
