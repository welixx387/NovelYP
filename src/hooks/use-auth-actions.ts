"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { SESSION_QUERY_KEY } from "@/hooks/use-current-user";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/validations";
import type { SessionUser } from "@/types";

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiRequest<SessionUser>("/api/auth/register", { json: input }),
    onSuccess: (user) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      toast.success(`Добро пожаловать, ${user.name}!`);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => apiRequest<SessionUser>("/api/auth/login", { json: input }),
    onSuccess: (user) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      toast.success(`С возвращением, ${user.name}!`);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ ok: true }>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      toast.success("Вы вышли из аккаунта");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      apiRequest<{ ok: true }>("/api/auth/forgot-password", { json: input }),
    onSuccess: () => {
      toast.success("Если такой email зарегистрирован — письмо отправлено");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      apiRequest<{ ok: true }>("/api/auth/reset-password", { json: input }),
    onSuccess: () => {
      toast.success("Пароль обновлён, теперь можно войти");
    },
  });
}
