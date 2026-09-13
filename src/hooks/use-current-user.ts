"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/types";

async function fetchCurrentUser(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Не удалось получить данные пользователя");
  return res.json();
}

export const SESSION_QUERY_KEY = ["session-user"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchCurrentUser,
  });
}
