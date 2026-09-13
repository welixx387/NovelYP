import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import type { SessionUser } from "@/types";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Имя должно быть не короче 2 символов").max(50),
});

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await requireSessionUser();
    const { name } = updateProfileSchema.parse(await request.json());

    const user = await prisma.user.update({ where: { id: sessionUser.id }, data: { name } });

    const updated: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionUser["role"],
      avatarUrl: user.avatarUrl,
    };
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
