"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { reviewSchema } from "@/lib/validations";
import { apiRequest, type ClientApiError } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { StarRating } from "@/components/novel/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormError } from "@/components/ui/form-error";
import { getInitials, formatDate } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

interface ReviewFormValues {
  rating: number;
  text: string;
}

export function ReviewSection({
  novelSlug,
  initialReviews,
  hasReviewed,
}: {
  novelSlug: string;
  initialReviews: Review[];
  hasReviewed: boolean;
}) {
  const { data: user } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reviews, setReviews] = useState(initialReviews);
  const [submitted, setSubmitted] = useState(hasReviewed);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, text: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ReviewFormValues) =>
      apiRequest<Review>(`/api/novels/${novelSlug}/reviews`, { json: values }),
    onSuccess: (review) => {
      setReviews((prev) => [review, ...prev]);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["novel", novelSlug] });
    },
  });

  async function onSubmit(values: ReviewFormValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      setError("text", { message: (error as ClientApiError).message });
    }
  }

  return (
    <div className="space-y-6">
      {!user && (
        <p className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <button onClick={() => router.push("/login")} className="font-medium text-primary hover:underline">
            Войдите
          </button>
          , чтобы оставить отзыв.
        </p>
      )}

      {user && !submitted && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 rounded-xl border border-border p-4"
        >
          <Controller
            control={control}
            name="rating"
            render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
          />
          <Textarea
            placeholder="Поделитесь впечатлениями о ранобэ..."
            error={!!errors.text}
            {...register("text")}
          />
          <FormError message={errors.text?.message} />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Опубликовать отзыв
          </Button>
        </form>
      )}

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 rounded-xl border border-border p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {getInitials(review.user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{review.user.name}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                </div>
                <StarRating value={review.rating} size={14} />
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{review.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reviews.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Пока нет отзывов — будьте первым</p>
        )}
      </div>
    </div>
  );
}
