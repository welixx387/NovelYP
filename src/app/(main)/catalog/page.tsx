import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogView } from "./catalog-view";
import { NovelGridSkeleton } from "@/components/novel/novel-grid";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Все ранобэ и веб-новеллы: фильтры по жанру, статусу, году и рейтингу.",
};

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container py-10"><NovelGridSkeleton count={18} /></div>}>
      <CatalogView />
    </Suspense>
  );
}
