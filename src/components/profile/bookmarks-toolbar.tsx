"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

export function BookmarksToolbar() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const res = await fetch("/api/profile/bookmarks/export");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const slugs = JSON.parse(text);
      const result = await apiRequest<{ added: number }>("/api/profile/bookmarks/import", {
        json: { slugs },
      });
      toast.success(`Импортировано закладок: ${result.added}`);
      router.refresh();
    } catch {
      toast.error("Не удалось прочитать файл закладок");
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4" /> Экспорт
      </Button>
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" /> Импорт
      </Button>
      <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
    </div>
  );
}
