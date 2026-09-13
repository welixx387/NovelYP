import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, History, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";
import { getInitials, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfileOverviewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [bookmarksCount, historyCount, subscription, isActive] = await Promise.all([
    prisma.bookmark.count({ where: { userId: user.id } }),
    prisma.readingProgress.count({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    hasActiveSubscription(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {getInitials(user.name)}
        </div>
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/profile/bookmarks">
          <Card className="transition-colors hover:border-primary/50">
            <CardContent className="flex items-center gap-3 p-5">
              <Bookmark className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{bookmarksCount}</p>
                <p className="text-xs text-muted-foreground">Закладок</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile/history">
          <Card className="transition-colors hover:border-primary/50">
            <CardContent className="flex items-center gap-3 p-5">
              <History className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{historyCount}</p>
                <p className="text-xs text-muted-foreground">В истории чтения</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/subscription">
          <Card className={isActive ? "border-emerald-500/40 bg-emerald-500/5" : "transition-colors hover:border-primary/50"}>
            <CardContent className="flex items-center gap-3 p-5">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">
                  {isActive ? "Подписка активна" : "Нет подписки"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isActive && subscription?.expiresAt
                    ? `До ${formatDate(subscription.expiresAt)}`
                    : isActive
                      ? "Навсегда"
                      : "Оформить"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
