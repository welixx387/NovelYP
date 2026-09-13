"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { useForgotPassword } from "@/hooks/use-auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

export default function ForgotPasswordPage() {
  const mutation = useForgotPassword();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    await mutation.mutateAsync(data);
    setSent(true);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-6 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h1 className="mt-4 text-xl font-semibold">Проверьте почту</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Если такой email зарегистрирован, мы отправили на него ссылку для сброса пароля.
        </p>
        <Link href="/login" className="mt-6 text-sm font-medium text-primary hover:underline">
          Вернуться ко входу
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Восстановление пароля</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Укажите email — пришлём ссылку для сброса пароля.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            error={!!errors.email}
            className="mt-1.5"
            {...register("email")}
          />
          <FormError message={errors.email?.message} />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Отправить ссылку
        </Button>

        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Вернуться ко входу
        </Link>
      </form>
    </div>
  );
}
