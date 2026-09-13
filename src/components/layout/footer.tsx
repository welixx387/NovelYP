import Link from "next/link";
import { BookMarked } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 text-sm text-muted-foreground sm:flex-row">
        <Link href="/" className="flex items-center gap-2 font-medium text-foreground">
          <BookMarked className="h-5 w-5 text-primary" />
          Ranobe Reader
        </Link>
        <p>© {new Date().getFullYear()} Ranobe Reader. Учебный проект.</p>
        <div className="flex gap-4">
          <Link href="/catalog" className="hover:text-foreground">
            Каталог
          </Link>
          <Link href="/subscription" className="hover:text-foreground">
            Подписка
          </Link>
        </div>
      </div>
    </footer>
  );
}
