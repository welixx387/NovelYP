"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, History, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/profile", label: "Обзор", icon: User },
  { href: "/profile/bookmarks", label: "Закладки", icon: Bookmark },
  { href: "/profile/history", label: "История чтения", icon: History },
  { href: "/profile/settings", label: "Настройки", icon: Settings },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:w-56 md:flex-col md:overflow-visible">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
