import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { novels: true } } },
    });

    return NextResponse.json(
      genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug, count: g._count.novels }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
