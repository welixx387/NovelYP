"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { useRegister } from "@/hooks/use-auth-actions";
import type { ClientApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    try {
      await registerMutation.mutateAsync(data);
      router.push("/");
      router.refresh();
    } catch (error) {
      const apiError = error as ClientApiError;
      if (apiError.fieldErrors) {
        for (const [field, message] of Object.entries(apiError.fieldErrors)) {
          setError(field as keyof RegisterInput | "root", { message });
        }
      } else {
        setError("root", { message: apiError.message });
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Создать аккаунт</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Уже с нами?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Войти
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Имя</Label>
          <Input
            id="name"
            autoComplete="name"
            error={!!errors.name}
            className="mt-1.5"
            {...register("name")}
          />
          <FormError message={errors.name?.message} />
        </div>

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

        <div>
          <Label htmlFor="password">Пароль</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              error={!!errors.password}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FormError message={errors.password?.message} />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Повторите пароль</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
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
          Зарегистрироваться
        </Button>
      </form>
    </div>
  );
}
