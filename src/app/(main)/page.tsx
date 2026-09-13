import { getSessionUser } from "@/lib/auth";
import {
  getContinueReading,
  getGenresWithCounts,
  getPopularNovels,
  getRecentlyUpdatedNovels,
  getTopRatedNovels,
} from "@/lib/queries";
import { Hero } from "@/components/landing/hero";
import { SectionHeading } from "@/components/landing/section-heading";
import { NovelGrid } from "@/components/novel/novel-grid";
import { ContinueReadingSection } from "@/components/landing/continue-reading-section";
import { GenreShowcase } from "@/components/landing/genre-showcase";

export default async function HomePage() {
  const user = await getSessionUser();

  const [popular, recentlyUpdated, topRated, genres, continueReading] = await Promise.all([
    getPopularNovels(12),
    getRecentlyUpdatedNovels(12),
    getTopRatedNovels(8),
    getGenresWithCounts(),
    user ? getContinueReading(user.id) : Promise.resolve([]),
  ]);

  return (
    <>
      <Hero />

      <ContinueReadingSection items={continueReading} />

      <section className="container py-12">
        <SectionHeading title="Популярное" subtitle="Читают прямо сейчас" href="/catalog?sort=popular" />
        <NovelGrid novels={popular} />
      </section>

      <section className="container py-12">
        <SectionHeading
          title="Новые главы"
          subtitle="Недавно обновлённые истории"
          href="/catalog?sort=new"
        />
        <NovelGrid novels={recentlyUpdated} />
      </section>

      <GenreShowcase genres={genres} />

      <section className="container py-12">
        <SectionHeading title="Топ по рейтингу" href="/catalog?sort=rating" />
        <NovelGrid novels={topRated} />
      </section>
    </>
  );
}
