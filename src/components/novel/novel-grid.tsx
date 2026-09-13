"use client";

import { motion } from "framer-motion";
import { NovelCard } from "./novel-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { NovelCardData } from "@/types";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export function NovelGrid({ novels }: { novels: NovelCardData[] }) {
  if (novels.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">Ничего не найдено</p>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {novels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </motion.div>
  );
}

export function NovelGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="mt-2.5 h-4 w-3/4 rounded" />
          <Skeleton className="mt-1.5 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
