import "server-only";
import { prisma } from "@/lib/prisma";
import { activateSubscription } from "@/lib/subscription";
import type { CryptoBotInvoice } from "@/lib/cryptobot";
import type { SubscriptionPlan } from "@/types";

// Общая точка для webhook'а и поллинга: обе стороны должны одинаково реагировать
// на статус инвойса, поэтому активация подписки живёт в одном месте.
// Идемпотентно — повторная доставка того же вебхука или параллельный поллинг ничего не сломает.
export async function confirmPayment(invoice: CryptoBotInvoice): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { invoiceId: String(invoice.invoice_id) } });
  if (!payment || payment.status === "PAID") return;

  if (invoice.status === "paid") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    await activateSubscription(payment.userId, payment.plan as SubscriptionPlan);
  } else if (invoice.status === "expired" && payment.status === "PENDING") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "EXPIRED" } });
  }
}
