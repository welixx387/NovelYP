"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { PLANS } from "@/lib/plans";
import type { SubscriptionPlan } from "@/types";

interface CheckoutInfo {
  invoiceId: string;
  payUrl: string;
  asset: string;
  amount: string;
  expiresAt: string | null;
}

type Asset = "USDT" | "TON";

function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    function tick() {
      setSecondsLeft(Math.max(0, Math.round((target - Date.now()) / 1000)));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return secondsLeft;
}

function fireConfetti() {
  const duration = 1500;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#8b5cf6", "#06b6d4", "#f472b6"] });
    confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#8b5cf6", "#06b6d4", "#f472b6"] });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function CheckoutModal({
  plan,
  asset,
  onClose,
  onPaid,
}: {
  plan: SubscriptionPlan;
  asset: Asset;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [checkout, setCheckout] = useState<CheckoutInfo | null>(null);
  const hasFiredConfetti = useRef(false);

  const createCheckout = useMutation({
    mutationFn: () => apiRequest<CheckoutInfo>("/api/subscription/checkout", { json: { plan, asset } }),
    onSuccess: setCheckout,
    onError: () => toast.error("Не удалось создать счёт. Попробуйте ещё раз."),
  });

  useEffect(() => {
    createCheckout.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, asset]);

  const secondsLeft = useCountdown(checkout?.expiresAt ?? null);
  const locallyExpired = secondsLeft === 0;

  const statusQuery = useQuery({
    queryKey: ["invoice-status", checkout?.invoiceId],
    queryFn: () => apiRequest<{ status: string }>(`/api/subscription/status/${checkout!.invoiceId}`),
    enabled: Boolean(checkout) && !locallyExpired,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 3000 : false),
  });

  const status = statusQuery.data?.status ?? "PENDING";

  useEffect(() => {
    if (status === "PAID" && !hasFiredConfetti.current) {
      hasFiredConfetti.current = true;
      fireConfetti();
      onPaid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function copyPayUrl() {
    if (!checkout) return;
    navigator.clipboard.writeText(checkout.payUrl);
    toast.success("Ссылка скопирована");
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>Оплата через CryptoBot</DialogTitle>
        </DialogHeader>

        {createCheckout.isPending && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Создаём счёт в CryptoBot...</p>
          </div>
        )}

        {createCheckout.isError && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="font-medium">Не удалось создать счёт</p>
            <p className="text-sm text-muted-foreground">
              CryptoBot временно недоступен или не настроен на сервере. Попробуйте ещё раз чуть позже.
            </p>
            <Button className="mt-2 w-full" onClick={() => createCheckout.mutate()}>
              Попробовать снова
            </Button>
          </div>
        )}

        <>
          {checkout && status === "PENDING" && !locallyExpired && (
            <div key="pending" className="flex flex-col items-center gap-4 py-2 animate-fade-in">
              <div className="relative">
                <span className="absolute inset-0 rounded-2xl animate-pulse-ring" />
                <div className="relative rounded-2xl border border-border bg-white p-3">
                  <QRCodeSVG value={checkout.payUrl} size={180} />
                </div>
              </div>

              <p className="text-2xl font-bold">
                {checkout.amount} {checkout.asset}
              </p>

              {secondsLeft !== null && (
                <p className="text-sm text-muted-foreground">
                  Счёт активен ещё {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </p>
              )}

              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={copyPayUrl}>
                  <Copy className="h-4 w-4" /> Копировать
                </Button>
                <Button className="flex-1" asChild>
                  <a href={checkout.payUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Открыть в Telegram
                  </a>
                </Button>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Ожидаем подтверждение оплаты...
              </p>
            </div>
          )}

          {status === "PAID" && (
            <div key="paid" className="flex flex-col items-center gap-3 py-8 animate-fade-in">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <p className="text-lg font-semibold">Оплата прошла успешно!</p>
              <p className="text-sm text-muted-foreground">
                Подписка «{PLANS[plan].title}» активирована.
              </p>
              <Button className="mt-2 w-full" onClick={onClose}>
                Готово
              </Button>
            </div>
          )}

          {(status === "EXPIRED" || locallyExpired) && status !== "PAID" && (
            <div key="expired" className="flex flex-col items-center gap-3 py-8 animate-fade-in">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium">Счёт истёк</p>
              <p className="text-sm text-muted-foreground">Создайте новый счёт, чтобы продолжить оплату.</p>
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  hasFiredConfetti.current = false;
                  createCheckout.mutate();
                }}
              >
                Попробовать снова
              </Button>
            </div>
          )}
        </>
      </DialogContent>
    </Dialog>
  );
}
