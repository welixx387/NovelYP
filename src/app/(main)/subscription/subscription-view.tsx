"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { QrCode, Wallet, Zap } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { apiRequest } from "@/lib/api-client";
import { PLANS } from "@/lib/plans";
import { PricingCard } from "@/components/subscription/pricing-card";
import { CheckoutModal } from "@/components/subscription/checkout-modal";
import { formatDate } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

interface MySubscription {
  plan: SubscriptionPlan | null;
  status: string;
  expiresAt: string | null;
  isActive: boolean;
}

const STEPS = [
  { icon: Wallet, title: "Выберите тариф", text: "Укажите план и валюту — USDT или TON" },
  { icon: QrCode, title: "Оплатите в Telegram", text: "Отсканируйте QR-код или откройте ссылку в @CryptoBot" },
  { icon: Zap, title: "Мгновенная активация", text: "Подписка включается сразу после подтверждения платежа" },
];

export function SubscriptionView() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [checkout, setCheckout] = useState<{ plan: SubscriptionPlan; asset: "USDT" | "TON" } | null>(null);

  const { data: mySubscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => apiRequest<MySubscription>("/api/subscription/me"),
    enabled: Boolean(user),
  });

  function handleSelect(plan: SubscriptionPlan, asset: "USDT" | "TON") {
    if (!user) {
      router.push("/login?from=/subscription");
      return;
    }
    setCheckout({ plan, asset });
  }

  return (
    <div className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Премиум-подписка</h1>
        <p className="mt-3 text-muted-foreground">
          Доступ ко всем премиум-главам, оплата криптовалютой через @CryptoBot прямо в Telegram.
        </p>
      </motion.div>

      {mySubscription?.isActive && mySubscription.plan && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mt-6 max-w-md rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm"
        >
          У вас активна подписка «{PLANS[mySubscription.plan].title}»
          {mySubscription.expiresAt && ` до ${formatDate(mySubscription.expiresAt)}`}
        </motion.div>
      )}

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
        {Object.values(PLANS).map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <PricingCard
              plan={plan}
              highlighted={plan.id === "YEARLY"}
              onSelect={(asset) => handleSelect(plan.id, asset)}
            />
          </motion.div>
        ))}
      </div>

      <div className="mx-auto mt-20 grid max-w-4xl gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-medium">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
          </motion.div>
        ))}
      </div>

      {checkout && (
        <CheckoutModal
          plan={checkout.plan}
          asset={checkout.asset}
          onClose={() => setCheckout(null)}
          onPaid={() => queryClient.invalidateQueries({ queryKey: ["my-subscription"] })}
        />
      )}
    </div>
  );
}
