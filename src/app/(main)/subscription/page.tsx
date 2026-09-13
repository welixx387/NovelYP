import type { Metadata } from "next";
import { SubscriptionView } from "./subscription-view";

export const metadata: Metadata = {
  title: "Подписка",
  description: "Премиум-подписка с оплатой криптовалютой через CryptoBot: месяц, год или навсегда.",
};

export default function SubscriptionPage() {
  return <SubscriptionView />;
}
