"use client";

export interface ClientApiError extends Error {
  fieldErrors?: Record<string, string>;
}

export async function apiRequest<T>(
  url: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    method: rest.method ?? (json ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error ?? "Что-то пошло не так") as ClientApiError;
    error.fieldErrors = data.fieldErrors;
    throw error;
  }

  return data as T;
}
