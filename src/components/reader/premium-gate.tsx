import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumGate({
  novelSlug,
  chapterTitle,
  isLoggedIn,
}: {
  novelSlug: string;
  chapterTitle: string;
  isLoggedIn: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-xl font-semibold">Премиум-глава</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        «{chapterTitle}» доступна только по подписке. Оформите её, чтобы читать все премиум-главы
        без ограничений.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" asChild>
          <Link href={`/novel/${novelSlug}`}>Назад к ранобэ</Link>
        </Button>
        <Button asChild>
          <Link href={isLoggedIn ? "/subscription" : "/login"}>
            {isLoggedIn ? "Оформить подписку" : "Войти"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
