import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { getInvoiceById } from "@/lib/cryptobot";
import { confirmPayment } from "@/lib/payments";
import { handleApiError, ApiError } from "@/lib/api-error";

// Резервный канал подтверждения оплаты — на случай, если вебхук от CryptoBot ещё не
// пришёл (или сервер вебхуков недоступен из интернета, например при локальной разработке).
// Фронтенд дергает этот роут поллингом, пока статус не станет PAID/EXPIRED.
export async function GET(_request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const user = await requireSessionUser();

    const payment = await prisma.payment.findUnique({ where: { invoiceId: params.invoiceId } });
    if (!payment || payment.userId !== user.id) {
      throw new ApiError("Счёт не найден", 404);
    }

    if (payment.status === "PENDING") {
      const invoice = await getInvoiceById(params.invoiceId);
      if (invoice) await confirmPayment(invoice);
    }

    const fresh = await prisma.payment.findUnique({ where: { invoiceId: params.invoiceId } });
    return NextResponse.json({ status: fresh?.status ?? payment.status });
  } catch (error) {
    return handleApiError(error);
  }
}
