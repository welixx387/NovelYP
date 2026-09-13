"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/landing/aurora-background";

const TITLE_WORDS = ["Погрузись", "в", "мир", "ранобэ"];

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Лёгкий параллакс: фон уезжает медленнее контента, текст чуть тускнеет при скролле
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[88vh] items-center overflow-hidden">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <AuroraBackground />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity }}
        className="container relative z-10 flex flex-col items-center py-24 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Тысячи глав уже ждут вас
        </motion.div>

        <h1 className="max-w-3xl text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          {TITLE_WORDS.map((word, i) => (
            <motion.span
              key={word}
              variants={wordVariants}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
              className={
                i === TITLE_WORDS.length - 1
                  ? "text-gradient mr-3 inline-block"
                  : "mr-3 inline-block"
              }
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 max-w-xl text-balance text-lg text-muted-foreground"
        >
          Читайте любимые ранобэ и веб-новеллы в удобной читалке с закладками,
          прогрессом чтения и настройками под себя.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" asChild>
            <Link href="/catalog">
              Начать читать <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/subscription">Премиум-доступ</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
