"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { NovelCardData } from "@/types";

async function searchNovels(query: string): Promise<NovelCardData[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/novels?search=${encodeURIComponent(query)}&limit=6`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const { data: results, isFetching } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => searchNovels(debouncedQuery),
    enabled: open && debouncedQuery.trim().length > 0,
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function goTo(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/novel/${slug}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-xs items-center gap-2 rounded-lg border border-input bg-background px-3.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Поиск ранобэ...</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] max-w-lg translate-y-0 p-0">
          <DialogTitle className="sr-only">Поиск ранобэ</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Название, автор..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-none px-0 shadow-none focus-visible:ring-0"
            />
            {isFetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {debouncedQuery && !isFetching && results?.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Ничего не найдено по запросу «{debouncedQuery}»
              </p>
            )}

            {results?.map((novel) => (
              <button
                key={novel.id}
                onClick={() => goTo(novel.slug)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent"
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                  {novel.coverUrl ? (
                    <Image src={novel.coverUrl} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <BookOpen className="m-auto h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{novel.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{novel.author}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
