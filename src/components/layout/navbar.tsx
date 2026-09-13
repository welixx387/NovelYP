"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, Menu, X } from "lucide-react";
import { GlobalSearch } from "@/components/layout/global-search";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/subscription", label: "Подписка" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <BookMarked className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">Ranobe Reader</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                pathname.startsWith(link.href) && "bg-accent text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden flex-1 justify-end sm:flex">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <ThemeToggle />
          <div className="hidden sm:block">
            <UserMenu />
          </div>
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Меню"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              <div className="mb-2">
                <GlobalSearch />
              </div>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-border/60 pt-3">
                <UserMenu />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
