"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface CatalogFilters {
  search: string;
  genre: string;
  status: string;
  year: string;
  sort: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Любой статус" },
  { value: "ONGOING", label: "Онгоинг" },
  { value: "COMPLETED", label: "Завершён" },
  { value: "HIATUS", label: "Пауза" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "По популярности" },
  { value: "new", label: "Сначала новые" },
  { value: "rating", label: "По рейтингу" },
  { value: "title", label: "По названию" },
];

interface Genre {
  slug: string;
  name: string;
  count: number;
}

export function FiltersBar({
  filters,
  genres,
  years,
  onChange,
}: {
  filters: CatalogFilters;
  genres: Genre[];
  years: number[];
  onChange: (patch: Partial<CatalogFilters>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Поиск по названию или автору..."
            className="pl-10"
          />
        </div>

        <Select value={filters.status} onValueChange={(v) => onChange({ status: v })}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.year} onValueChange={(v) => onChange({ year: v })}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Год" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любой год</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(v) => onChange({ sort: v })}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange({ genre: "all" })}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            filters.genre === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-accent"
          )}
        >
          Все жанры
        </button>
        {genres.map((genre) => (
          <button
            key={genre.slug}
            onClick={() => onChange({ genre: genre.slug })}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              filters.genre === genre.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent"
            )}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}
