import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Новый пароль</h1>
      <p className="mt-1 text-sm text-muted-foreground">Придумайте новый пароль для входа.</p>

      <Suspense fallback={<div className="mt-6 h-40 skeleton rounded-lg" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
