import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, type CryptoBotWebhookUpdate } from "@/lib/cryptobot";
import { confirmPayment } from "@/lib/payments";

// Настраивается в @CryptoBot -> Crypto Pay -> My Apps -> Webhooks -> URL этого роута.
// ВАЖНО: подпись считается по сырому телу запроса — request.json() тут нельзя использовать
// раньше, чем прочитан text(), иначе для проверки подписи не останется исходной строки.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("crypto-pay-api-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Неверная подпись" }, { status: 401 });
  }

  const update = JSON.parse(rawBody) as CryptoBotWebhookUpdate;

  if (update.update_type === "invoice_paid") {
    await confirmPayment(update.payload);
  }

  return NextResponse.json({ ok: true });
}
