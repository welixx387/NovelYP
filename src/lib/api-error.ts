import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorBody {
  error: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

// Единая точка обработки ошибок для route-хендлеров: превращает известные типы
// ошибок в аккуратный JSON-ответ с нужным статусом, не раскрывая внутренние детали.
export function handleApiError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Проверьте правильность заполнения полей", fieldErrors: fieldErrorsFromZod(error) },
      { status: 400 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, fieldErrors: error.fieldErrors },
      { status: error.status }
    );
  }

  if (error instanceof Error && error.name === "UnauthorizedError") {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  console.error(error);
  return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
}
