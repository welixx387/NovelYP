"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { useResetPassword } from "@/hooks/use-auth-actions";
import type { ClientApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const mutation = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordInput) {
    try {
      await mutation.mutateAsync(data);
      router.push("/login");
    } catch (error) {
      const apiError = error as ClientApiError;
      setError("root", { message: apiError.fieldErrors?.root ?? apiError.message });
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Ссылка неполная — откройте её снова из письма.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <input type="hidden" {...register("token")} />

      <div>
        <Label htmlFor="password">Новый пароль</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          error={!!errors.password}
          className="mt-1.5"
          {...register("password")}
        />
        <FormError message={errors.password?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Повторите пароль</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          className="mt-1.5"
          {...register("confirmPassword")}
        />
        <FormError message={errors.confirmPassword?.message} />
      </div>

      <FormError message={errors.root?.message} />

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Сохранить новый пароль
      </Button>
    </form>
  );
}
