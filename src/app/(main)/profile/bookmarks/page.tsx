import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getBookmarkedNovels } from "@/lib/queries";
import { NovelGrid } from "@/components/novel/novel-grid";
import { BookmarksToolbar } from "@/components/profile/bookmarks-toolbar";

export default async function BookmarksPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const novels = await getBookmarkedNovels(user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Закладки</h2>
        <BookmarksToolbar />
      </div>
      {novels.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока пусто — добавляйте ранобэ в закладки со страницы новеллы.
        </p>
      ) : (
        <NovelGrid novels={novels} />
      )}
    </div>
  );
}
