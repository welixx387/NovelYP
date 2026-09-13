import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

    const isActive = Boolean(
      subscription?.status === "ACTIVE" &&
        (!subscription.expiresAt || subscription.expiresAt.getTime() > Date.now())
    );

    return NextResponse.json({
      plan: subscription?.plan ?? null,
      status: subscription?.status ?? "NONE",
      expiresAt: subscription?.expiresAt?.toISOString() ?? null,
      isActive,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
