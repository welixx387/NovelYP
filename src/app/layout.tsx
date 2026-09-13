import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Ranobe Reader — читай ранобэ онлайн",
    template: "%s — Ranobe Reader",
  },
  description:
    "Онлайн-читалка ранобэ и веб-новелл: удобный режим чтения, закладки, рейтинги и премиум-главы по подписке.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Ranobe Reader",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="theme">
          <QueryProvider>
            {children}
            <Toaster richColors position="top-center" theme="system" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
