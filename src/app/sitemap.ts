import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const novels = await prisma.novel.findMany({ select: { slug: true, updatedAt: true } });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/catalog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/subscription`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const novelRoutes: MetadataRoute.Sitemap = novels.map((novel) => ({
    url: `${BASE_URL}/novel/${novel.slug}`,
    lastModified: novel.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...novelRoutes];
}
