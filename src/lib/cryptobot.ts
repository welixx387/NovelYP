import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";

// Клиент Crypto Pay API (@CryptoBot). Документация: https://help.crypt.bot/crypto-pay-api
// Всё общение с CryptoBot стянуто в этот файл — если API поменяется, править только здесь.

const BASE_URL =
  process.env.CRYPTOBOT_TESTNET === "true"
    ? "https://testnet-pay.crypt.bot/api"
    : "https://pay.crypt.bot/api";

export interface CryptoBotInvoice {
  invoice_id: number;
  status: "active" | "paid" | "expired";
  hash: string;
  asset: string;
  amount: string;
  description?: string;
  payload?: string;
  pay_url: string;
  bot_invoice_url?: string;
  created_at: string;
  expiration_date?: string;
  paid_at?: string | null;
}

interface CryptoBotResponse<T> {
  ok: boolean;
  result?: T;
  error?: { code: number; name: string };
}

function getToken(): string {
  const token = process.env.CRYPTOBOT_API_TOKEN;
  if (!token) {
    throw new Error("CRYPTOBOT_API_TOKEN не задан в переменных окружения");
  }
  return token;
}

async function callMethod<T>(method: string, params?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Crypto-Pay-API-Token": getToken(),
    },
    body: JSON.stringify(params ?? {}),
    cache: "no-store",
  });

  const data = (await res.json()) as CryptoBotResponse<T>;

  if (!data.ok || !data.result) {
    throw new Error(`CryptoBot API error [${method}]: ${data.error?.name ?? res.statusText}`);
  }

  return data.result;
}

interface CreateInvoiceInput {
  amount: string;
  asset: "USDT" | "TON";
  description: string;
  payload: string; // произвольные данные, которые вернутся вебхуком (у нас — userId:plan)
  expiresIn?: number; // секунды, по умолчанию час
}

export async function createInvoice(input: CreateInvoiceInput): Promise<CryptoBotInvoice> {
  return callMethod<CryptoBotInvoice>("createInvoice", {
    currency_type: "crypto",
    asset: input.asset,
    amount: input.amount,
    description: input.description,
    payload: input.payload,
    expires_in: input.expiresIn ?? 3600,
    allow_comments: false,
    allow_anonymous: false,
  });
}

export async function getInvoiceById(invoiceId: number | string): Promise<CryptoBotInvoice | null> {
  const result = await callMethod<{ items: CryptoBotInvoice[] }>("getInvoices", {
    invoice_ids: String(invoiceId),
  });
  return result.items[0] ?? null;
}

export interface CryptoBotBalance {
  currency_code: string;
  available: string;
  onhold: string;
}

export async function getBalance(): Promise<CryptoBotBalance[]> {
  return callMethod<CryptoBotBalance[]>("getBalance");
}

// Подпись вебхука: HMAC-SHA256(sha256(API_TOKEN), rawBody), сравнение — константное по времени.
// Важно передавать именно СЫРУЮ строку тела запроса, а не JSON.stringify(parsed) —
// перепаковка объекта может изменить порядок ключей/пробелы и сломать проверку.
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const secretKey = createHash("sha256").update(getToken()).digest();
  const expected = createHmac("sha256", secretKey).update(rawBody).digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}

export interface CryptoBotWebhookUpdate {
  update_id: number;
  update_type: "invoice_paid";
  request_date: string;
  payload: CryptoBotInvoice;
}
