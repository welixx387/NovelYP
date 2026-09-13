"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, cn } from "@/lib/utils";

interface ChapterItem {
  id: string;
  number: number;
  title: string;
  isPremium: boolean;
  publishedAt: string;
}

export function ChapterList({
  novelSlug,
  chapters,
  hasActiveSubscription,
  continueChapterNumber,
}: {
  novelSlug: string;
  chapters: ChapterItem[];
  hasActiveSubscription: boolean;
  continueChapterNumber: number | null;
}) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {chapters.map((chapter, i) => {
        const locked = chapter.isPremium && !hasActiveSubscription;
        const isCurrent = chapter.number === continueChapterNumber;

        return (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: Math.min(i, 20) * 0.02 }}
          >
            <Link
              href={locked ? "/subscription" : `/reader/${novelSlug}/${chapter.number}`}
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-3.5 text-sm transition-colors hover:bg-accent",
                isCurrent && "bg-accent/60"
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                <span className="shrink-0 text-muted-foreground">#{chapter.number}</span>
                <span className="truncate font-medium">{chapter.title}</span>
                {isCurrent && (
                  <Badge variant="outline" className="shrink-0">
                    Читаете
                  </Badge>
                )}
                {chapter.isPremium && (
                  <Badge variant="warning" className="shrink-0">
                    Премиум
                  </Badge>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(chapter.publishedAt)}
              </span>
            </Link>
          </motion.div>
        );
      })}

      {chapters.length === 0 && (
        <p className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
          <MessageSquareText className="h-4 w-4" /> Глав пока нет
        </p>
      )}
    </div>
  );
}
