import Link from "next/link";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <BookX className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">Страница не найдена</h1>
      <p className="max-w-sm text-muted-foreground">
        Похоже, эта глава ещё не написана. Возможно, ранобэ было удалено или ссылка устарела.
      </p>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
