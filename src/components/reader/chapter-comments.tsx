"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageCircle } from "lucide-react";
import { commentSchema } from "@/lib/validations";
import { apiRequest } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { getInitials, formatRelativeTime } from "@/lib/utils";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

interface CommentFormValues {
  text: string;
}

export function ChapterComments({
  chapterId,
  initialComments,
  isLoggedIn,
}: {
  chapterId: string;
  initialComments: Comment[];
  isLoggedIn: boolean;
}) {
  const [comments, setComments] = useState(initialComments);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({ resolver: zodResolver(commentSchema) });

  const mutation = useMutation({
    mutationFn: (values: CommentFormValues) =>
      apiRequest<Comment>(`/api/chapters/${chapterId}/comments`, { json: values }),
    onSuccess: (comment) => {
      setComments((prev) => [comment, ...prev]);
      reset();
    },
  });

  return (
    <div className="space-y-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <MessageCircle className="h-5 w-5" /> Комментарии ({comments.length})
      </h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit((v) => mutation.mutateAsync(v))} className="space-y-2">
          <Textarea placeholder="Ваш комментарий к главе..." error={!!errors.text} {...register("text")} />
          <FormError message={errors.text?.message} />
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Отправить
          </Button>
        </form>
      ) : (
        <p className="text-sm opacity-70">Войдите, чтобы оставить комментарий.</p>
      )}

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {getInitials(comment.user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-medium">{comment.user.name}</p>
                  <span className="text-xs opacity-60">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm opacity-90">{comment.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
