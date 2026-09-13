"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NovelCardData } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  ONGOING: "Онгоинг",
  COMPLETED: "Завершён",
  HIATUS: "Пауза",
};

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning"> = {
  ONGOING: "default",
  COMPLETED: "success",
  HIATUS: "warning",
};

export const novelCardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function NovelCard({ novel }: { novel: NovelCardData }) {
  const ref = useRef<HTMLDivElement>(null);

  // 3D-наклон обложки по позиции курсора: x/y — координаты внутри карточки (-0.5..0.5),
  // rotateX/rotateY выводятся из них через spring, чтобы наклон был плавным, а не резким.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 22 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div variants={novelCardVariants}>
      <Link href={`/novel/${novel.slug}`} className="group block">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformPerspective: 800 }}
          whileHover={{ y: -6 }}
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-muted shadow-sm transition-shadow duration-300 group-hover:shadow-[0_20px_45px_-15px_hsl(var(--primary)/0.45)]">
            <Image
              src={novel.coverUrl}
              alt={novel.title}
              fill
              sizes="(max-width: 768px) 45vw, (max-width: 1200px) 22vw, 200px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
            <Badge variant={STATUS_VARIANTS[novel.status]} className="absolute left-2 top-2">
              {STATUS_LABELS[novel.status]}
            </Badge>
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between text-xs font-medium text-white">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {novel.rating > 0 ? novel.rating.toFixed(1) : "—"}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {novel.chaptersCount}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mt-2.5 space-y-0.5">
          <h3 className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
            {novel.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{novel.author}</p>
        </div>
      </Link>
    </motion.div>
  );
}
