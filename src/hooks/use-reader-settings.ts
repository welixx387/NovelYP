"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReaderFont, ReaderTheme } from "@/types";

interface ReaderSettingsState {
  fontSize: number;
  fontFamily: ReaderFont;
  lineHeight: number;
  columnWidth: number;
  theme: ReaderTheme;
  setFontSize: (value: number) => void;
  setFontFamily: (value: ReaderFont) => void;
  setLineHeight: (value: number) => void;
  setColumnWidth: (value: number) => void;
  setTheme: (value: ReaderTheme) => void;
}

// persist сам сохраняет и восстанавливает настройки из localStorage — это и есть
// требуемое "автосохранение" пользовательских настроек читалки между визитами.
export const useReaderSettings = create<ReaderSettingsState>()(
  persist(
    (set) => ({
      fontSize: 19,
      fontFamily: "sans",
      lineHeight: 1.8,
      columnWidth: 720,
      theme: "dark",
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setColumnWidth: (columnWidth) => set({ columnWidth }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "reader-settings" }
  )
);
