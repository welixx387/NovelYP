"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/landing/section-heading";

interface Genre {
  slug: string;
  name: string;
  count: number;
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function GenreShowcase({ genres }: { genres: Genre[] }) {
  return (
    <section className="container py-12">
      <SectionHeading title="Жанры" subtitle="Выберите то, что по душе" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="flex flex-wrap gap-2.5"
      >
        {genres.map((genre) => (
          <motion.div key={genre.slug} variants={itemVariants}>
            <Link
              href={`/catalog?genre=${genre.slug}`}
              className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_20px_-8px_hsl(var(--primary)/0.4)]"
            >
              <span className="font-medium group-hover:text-primary">{genre.name}</span>
              <span className="text-xs text-muted-foreground">{genre.count}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
