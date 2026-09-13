"use client";

import Link from "next/link";
import { ArrowLeft, List, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChapterRef {
  id: string;
  number: number;
  title: string;
}

export function ReaderToolbar({
  novelSlug,
  novelTitle,
  chapter,
  chapters,
  onOpenSettings,
}: {
  novelSlug: string;
  novelTitle: string;
  chapter: { number: number; title: string };
  chapters: ChapterRef[];
  onOpenSettings: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-current/10 bg-inherit px-4 py-3">
      <Link
        href={`/novel/${novelSlug}`}
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm opacity-80 transition-opacity hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Назад</span>
      </Link>

      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-medium">{novelTitle}</p>
        <p className="truncate text-xs opacity-60">
          Глава {chapter.number}. {chapter.title}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="shrink-0 rounded-lg p-2 opacity-80 transition-opacity hover:opacity-100"
            aria-label="Список глав"
          >
            <List className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
          {chapters.map((c) => (
            <DropdownMenuItem key={c.id} asChild>
              <Link href={`/reader/${novelSlug}/${c.number}`}>
                #{c.number} {c.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={onOpenSettings}
        className="shrink-0 rounded-lg p-2 opacity-80 transition-opacity hover:opacity-100"
        aria-label="Настройки чтения"
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
}
