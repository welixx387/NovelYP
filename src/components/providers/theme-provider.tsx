"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

// next-themes сам читает/пишет localStorage и выставляет класс "dark"/"light" на <html>
// ещё до гидратации React (инлайн-скрипт), поэтому мигания темы при загрузке нет.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
