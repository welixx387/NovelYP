import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/auth";
import { getReadingHistory } from "@/lib/queries";
import { formatRelativeTime } from "@/lib/utils";

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const history = await getReadingHistory(user.id);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">История чтения</h2>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">Вы ещё ничего не читали.</p>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <Link
              key={item.novelSlug}
              href={`/reader/${item.novelSlug}/${item.chapterNumber}`}
              className="flex items-center gap-4 rounded-xl border border-border p-3 transition-colors hover:border-primary/50"
            >
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={item.coverUrl} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.novelTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Глава {item.chapterNumber} · {Math.round(item.scrollPercent * 100)}% прочитано
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(item.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
