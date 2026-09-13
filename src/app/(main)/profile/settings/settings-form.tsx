"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Loader2, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { SESSION_QUERY_KEY } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const schema = z.object({ name: z.string().min(2, "Слишком короткое имя").max(50) });
type FormValues = z.infer<typeof schema>;

export function SettingsForm({ user }: { user: SessionUser }) {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: user.name } });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => apiRequest<SessionUser>("/api/profile", { method: "PATCH", json: values }),
    onSuccess: (updated) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, updated);
      toast.success("Профиль обновлён");
    },
  });

  return (
    <div className="max-w-md space-y-8">
      <form onSubmit={handleSubmit((v) => mutation.mutateAsync(v))} className="space-y-4">
        <div>
          <Label htmlFor="name">Имя</Label>
          <Input id="name" className="mt-1.5" error={!!errors.name} {...register("name")} />
          <FormError message={errors.name?.message} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user.email} disabled className="mt-1.5" />
        </div>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить
        </Button>
      </form>

      <div>
        <Label>Тема оформления</Label>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors",
              theme === "light" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
            )}
          >
            <Sun className="h-4 w-4" /> Светлая
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors",
              theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
            )}
          >
            <Moon className="h-4 w-4" /> Тёмная
          </button>
        </div>
      </div>
    </div>
  );
}
