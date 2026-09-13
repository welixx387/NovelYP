"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanConfig } from "@/lib/plans";

const ASSETS = ["USDT", "TON"] as const;
type Asset = (typeof ASSETS)[number];

const FEATURES = ["Все премиум-главы", "Без рекламы", "Ранний доступ к новым главам"];

export function PricingCard({
  plan,
  highlighted,
  onSelect,
  loading,
}: {
  plan: PlanConfig;
  highlighted?: boolean;
  onSelect: (asset: Asset) => void;
  loading?: boolean;
}) {
  const [asset, setAsset] = useState<Asset>("USDT");

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-shadow",
        highlighted
          ? "border-primary bg-primary/[0.04] shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]"
          : "border-border bg-card"
      )}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Sparkles className="h-3 w-3" /> Популярный выбор
        </Badge>
      )}

      <h3 className="text-lg font-semibold">{plan.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold">{plan.prices[asset]}</span>
        <span className="text-sm text-muted-foreground">{asset}</span>
        {plan.discountLabel && <Badge variant="success" className="ml-2">{plan.discountLabel}</Badge>}
      </div>

      <div className="mt-3 inline-flex w-fit rounded-lg border border-border p-0.5">
        {ASSETS.map((a) => (
          <button
            key={a}
            onClick={() => setAsset(a)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              asset === a ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        className="mt-6 w-full"
        variant={highlighted ? "default" : "outline"}
        onClick={() => onSelect(asset)}
        disabled={loading}
      >
        Оплатить
      </Button>
    </motion.div>
  );
}
