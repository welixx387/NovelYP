"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import type { ContinueReadingItem } from "@/types";

export function ContinueReadingSection({ items }: { items: ContinueReadingItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="container py-12">
      <SectionHeading title="Продолжить чтение" />
      <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2">
        {items.map((item, i) => (
          <motion.div
            key={item.novelSlug}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link
              href={`/reader/${item.novelSlug}/${item.chapterNumber}`}
              className="group flex w-64 shrink-0 gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
            >
              <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={item.coverUrl} alt="" fill sizes="64px" className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-6 w-6 fill-white text-white" />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div>
                  <p className="line-clamp-2 text-sm font-medium">{item.novelTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Глава {item.chapterNumber}</p>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round(item.scrollPercent * 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
