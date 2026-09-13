import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { createInvoice } from "@/lib/cryptobot";
import { PLANS } from "@/lib/plans";
import { checkoutSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { plan, asset } = checkoutSchema.parse(await request.json());

    const config = PLANS[plan];
    const amount = config.prices[asset];

    const invoice = await createInvoice({
      amount,
      asset,
      description: `NovelYP — подписка «${config.title}»`,
      // payload дублирует данные из нашей БД на случай ручной сверки через getInvoices
      payload: `${user.id}:${plan}`,
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        invoiceId: String(invoice.invoice_id),
        plan,
        asset,
        amount,
        status: "PENDING",
        payUrl: invoice.pay_url,
      },
    });

    return NextResponse.json({
      invoiceId: String(invoice.invoice_id),
      payUrl: invoice.pay_url,
      asset,
      amount,
      expiresAt: invoice.expiration_date ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
