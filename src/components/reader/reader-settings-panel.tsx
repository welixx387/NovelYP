"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useReaderSettings } from "@/hooks/use-reader-settings";
import { cn } from "@/lib/utils";
import type { ReaderFont, ReaderTheme } from "@/types";

const FONT_OPTIONS: { value: ReaderFont; label: string; className: string }[] = [
  { value: "sans", label: "Без засечек", className: "font-sans" },
  { value: "serif", label: "С засечками", className: "font-serif" },
  { value: "mono", label: "Моноширинный", className: "font-mono" },
];

const THEME_OPTIONS: { value: ReaderTheme; label: string; swatch: string }[] = [
  { value: "light", label: "День", swatch: "bg-white border" },
  { value: "dark", label: "Ночь", swatch: "bg-zinc-900" },
  { value: "sepia", label: "Сепия", swatch: "bg-[#f4ecd8] border" },
];

export function ReaderSettingsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const settings = useReaderSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройки чтения</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Размер шрифта</span>
              <span className="text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <Slider
              min={14}
              max={30}
              step={1}
              value={[settings.fontSize]}
              onValueChange={([v]) => settings.setFontSize(v)}
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Межстрочный интервал</span>
              <span className="text-muted-foreground">{settings.lineHeight.toFixed(1)}</span>
            </div>
            <Slider
              min={1.3}
              max={2.4}
              step={0.1}
              value={[settings.lineHeight]}
              onValueChange={([v]) => settings.setLineHeight(v)}
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Ширина колонки</span>
              <span className="text-muted-foreground">{settings.columnWidth}px</span>
            </div>
            <Slider
              min={520}
              max={960}
              step={20}
              value={[settings.columnWidth]}
              onValueChange={([v]) => settings.setColumnWidth(v)}
            />
          </div>

          <div>
            <p className="mb-2 text-sm">Шрифт</p>
            <div className="grid grid-cols-3 gap-2">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => settings.setFontFamily(opt.value)}
                  className={cn(
                    "rounded-lg border px-2 py-2.5 text-xs transition-colors",
                    opt.className,
                    settings.fontFamily === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  )}
                >
                  Aa
                  <span className="mt-1 block text-[10px] text-muted-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm">Тема чтения</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => settings.setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs transition-colors",
                    settings.theme === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <span className={cn("h-5 w-8 rounded", opt.swatch)} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
