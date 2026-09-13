"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FiltersBar, type CatalogFilters } from "@/components/catalog/filters-bar";
import { NovelGrid, NovelGridSkeleton } from "@/components/novel/novel-grid";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { NovelCardData } from "@/types";

const PAGE_SIZE = 18;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - i);

interface Genre {
  slug: string;
  name: string;
  count: number;
}

interface NovelsResponse {
  items: NovelCardData[];
  total: number;
}

async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch("/api/genres");
  if (!res.ok) return [];
  return res.json();
}

async function fetchNovels(filters: CatalogFilters, page: number): Promise<NovelsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (filters.search) params.set("search", filters.search);
  if (filters.genre !== "all") params.set("genre", filters.genre);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.year !== "all") params.set("year", filters.year);
  params.set("sort", filters.sort);

  const res = await fetch(`/api/novels?${params.toString()}`);
  if (!res.ok) throw new Error("Не удалось загрузить каталог");
  return res.json();
}

export function CatalogView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CatalogFilters>({
    search: searchParams.get("search") ?? "",
    genre: searchParams.get("genre") ?? "all",
    status: searchParams.get("status") ?? "all",
    year: searchParams.get("year") ?? "all",
    sort: searchParams.get("sort") ?? "popular",
  });
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NovelCardData[]>([]);

  const debouncedSearch = useDebouncedValue(filters.search, 350);
  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  // Синхронизируем фильтры в URL, чтобы каталог с ними можно было сохранить в закладки/поделиться.
  useEffect(() => {
    const params = new URLSearchParams();
    if (queryFilters.search) params.set("search", queryFilters.search);
    if (queryFilters.genre !== "all") params.set("genre", queryFilters.genre);
    if (queryFilters.status !== "all") params.set("status", queryFilters.status);
    if (queryFilters.year !== "all") params.set("year", queryFilters.year);
    if (queryFilters.sort !== "popular") params.set("sort", queryFilters.sort);
    router.replace(`/catalog${params.toString() ? `?${params}` : ""}`, { scroll: false });
    setPage(1);
    setItems([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    queryFilters.search,
    queryFilters.genre,
    queryFilters.status,
    queryFilters.year,
    queryFilters.sort,
  ]);

  const { data: genres = [] } = useQuery({ queryKey: ["genres"], queryFn: fetchGenres });

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["novels", queryFilters, page],
    queryFn: () => fetchNovels(queryFilters, page),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!data) return;
    setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page]);

  const hasMore = data ? items.length < data.total : false;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Каталог ранобэ</h1>
      <p className="mt-1 text-muted-foreground">
        {/* "ранобэ" не склоняется по числам, поэтому форма всегда одна */}
        {data ? `${data.total} ранобэ найдено` : "Загрузка..."}
      </p>

      <div className="mt-6">
        <FiltersBar
          filters={filters}
          genres={genres}
          years={YEARS}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <NovelGridSkeleton />
        ) : (
          <NovelGrid novels={items} />
        )}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
            Показать ещё
          </Button>
        </div>
      )}
    </div>
  );
}
