import type { SubscriptionPlan } from "@/types";

// Чистые данные без обращения к БД — импортируется и на клиенте (карточки тарифов),
// и на сервере (src/lib/subscription.ts), поэтому здесь нет "server-only".

export interface PlanConfig {
  id: SubscriptionPlan;
  title: string;
  description: string;
  durationDays: number | null; // null = навсегда
  prices: { USDT: string; TON: string };
  discountLabel?: string;
}

// Цены — пример, поменяйте под свои тарифы. Суммы указаны в конкретной монете
// (CryptoBot принимает оплату сразу в крипте, без привязки к курсу фиата на нашей стороне).
export const PLANS: Record<SubscriptionPlan, PlanConfig> = {
  MONTHLY: {
    id: "MONTHLY",
    title: "Месяц",
    description: "Доступ ко всем премиум-главам на 30 дней",
    durationDays: 30,
    prices: { USDT: "3.99", TON: "2" },
  },
  YEARLY: {
    id: "YEARLY",
    title: "Год",
    description: "Доступ ко всем премиум-главам на 365 дней",
    durationDays: 365,
    prices: { USDT: "29.99", TON: "15" },
    discountLabel: "-37%",
  },
  LIFETIME: {
    id: "LIFETIME",
    title: "Навсегда",
    description: "Единоразовый платёж — доступ без ограничения по времени",
    durationDays: null,
    prices: { USDT: "79.99", TON: "40" },
  },
};
