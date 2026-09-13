import "server-only";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import type { SubscriptionPlan } from "@/types";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription || subscription.status !== "ACTIVE") return false;
  if (subscription.expiresAt && subscription.expiresAt.getTime() < Date.now()) return false;
  return true;
}

export async function activateSubscription(userId: string, plan: SubscriptionPlan) {
  const config = PLANS[plan];
  const now = new Date();
  const expiresAt = config.durationDays
    ? new Date(now.getTime() + config.durationDays * 86400_000)
    : null;

  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan, status: "ACTIVE", startedAt: now, expiresAt },
    update: { plan, status: "ACTIVE", startedAt: now, expiresAt },
  });
}
