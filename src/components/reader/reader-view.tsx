"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useReaderSettings } from "@/hooks/use-reader-settings";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiRequest } from "@/lib/api-client";
import { cn, clamp } from "@/lib/utils";
import { ReaderToolbar } from "@/components/reader/reader-toolbar";
import { ChapterNav } from "@/components/reader/chapter-nav";
import { ChapterComments } from "@/components/reader/chapter-comments";
import { ReaderSettingsPanel } from "@/components/reader/reader-settings-panel";

interface ReaderChapter {
  id: string;
  number: number;
  title: string;
  content: string;
}

interface ChapterRef {
  id: string;
  number: number;
  title: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

const THEME_CLASSES: Record<string, string> = {
  light: "bg-white text-zinc-900",
  dark: "bg-[#16161d] text-zinc-100",
  sepia: "bg-[#f4ecd8] text-[#3f3428]",
};

const FONT_CLASSES: Record<string, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

export function ReaderView({
  novel,
  chapter,
  chapters,
  prevChapterNumber,
  nextChapterNumber,
  comments,
  initialScrollPercent,
  isLoggedIn,
}: {
  novel: { id: string; slug: string; title: string };
  chapter: ReaderChapter;
  chapters: ChapterRef[];
  prevChapterNumber: number | null;
  nextChapterNumber: number | null;
  comments: Comment[];
  initialScrollPercent: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const settings = useReaderSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const restoredRef = useRef(false);

  const storageKey = `reading-progress:${novel.slug}:${chapter.number}`;

  // ReaderView монтируется заново на каждую главу (родитель передаёт key={chapter.id}),
  // поэтому restoredRef всегда стартует свежим — здесь достаточно восстановить позицию один раз.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const stored = Number(localStorage.getItem(storageKey));
    const percent = stored > 0 ? stored : initialScrollPercent;

    if (percent > 0.02) {
      const frame = requestAnimationFrame(() => {
        const scrollable = document.body.scrollHeight - window.innerHeight;
        if (scrollable > 0) window.scrollTo({ top: scrollable * percent });
      });
      return () => cancelAnimationFrame(frame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  // Прогресс-бар + автосохранение в localStorage при каждом скролле.
  useEffect(() => {
    let raf = 0;
    function handleScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollable = document.body.scrollHeight - window.innerHeight;
        const percent = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
        setScrollPercent(percent);
        localStorage.setItem(storageKey, String(percent));
      });
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, [storageKey]);

  // Для авторизованных — синхронизация прогресса на сервер, но не чаще раза в 2 секунды.
  const debouncedPercent = useDebouncedValue(scrollPercent, 2000);
  useEffect(() => {
    if (!isLoggedIn || debouncedPercent < 0.02) return;
    apiRequest("/api/progress", {
      json: {
        novelId: novel.id,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        scrollPercent: debouncedPercent,
      },
    }).catch(() => {
      // Тихо игнорируем — прогресс уже сохранён локально, попробуем при следующем скролле.
    });
  }, [debouncedPercent, isLoggedIn, novel.id, chapter.id, chapter.number]);

  // Горячие клавиши: ← / → — соседние главы, Esc — на страницу новеллы.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || settingsOpen) return;

      if (event.key === "ArrowRight" && nextChapterNumber) {
        router.push(`/reader/${novel.slug}/${nextChapterNumber}`);
      } else if (event.key === "ArrowLeft" && prevChapterNumber) {
        router.push(`/reader/${novel.slug}/${prevChapterNumber}`);
      } else if (event.key === "Escape") {
        router.push(`/novel/${novel.slug}`);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [novel.slug, nextChapterNumber, prevChapterNumber, settingsOpen, router]);

  return (
    <div className={cn("min-h-screen transition-colors duration-300", THEME_CLASSES[settings.theme])}>
      <div className="reading-progress" style={{ width: `${scrollPercent * 100}%` }} />

      <ReaderToolbar
        novelSlug={novel.slug}
        novelTitle={novel.title}
        chapter={chapter}
        chapters={chapters}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <motion.article
        key={chapter.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        className={cn("mx-auto px-6 py-14", FONT_CLASSES[settings.fontFamily])}
        style={{
          maxWidth: settings.columnWidth,
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
        }}
      >
        <h1 className="mb-8 text-2xl font-bold">
          Глава {chapter.number}. {chapter.title}
        </h1>
        <div className="whitespace-pre-wrap">{chapter.content}</div>
      </motion.article>

      <ChapterNav
        novelSlug={novel.slug}
        prevChapterNumber={prevChapterNumber}
        nextChapterNumber={nextChapterNumber}
      />

      <div className="mx-auto max-w-3xl px-6 pb-20">
        <ChapterComments chapterId={chapter.id} initialComments={comments} isLoggedIn={isLoggedIn} />
      </div>

      <ReaderSettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
