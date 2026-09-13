"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bookmark } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

export function NovelCover({
  slug,
  title,
  coverUrl,
  initialBookmarked,
}: {
  slug: string;
  title: string;
  coverUrl: string;
  initialBookmarked: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 250, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 250, damping: 20 });

  const bookmarkMutation = useMutation({
    mutationFn: () => apiRequest<{ bookmarked: boolean }>(`/api/novels/${slug}/bookmark`, { method: "POST" }),
    onSuccess: (data) => {
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Добавлено в закладки" : "Удалено из закладок");
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleBookmarkClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    bookmarkMutation.mutate();
  }

  return (
    <div className="relative w-full max-w-[260px]">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border shadow-2xl"
      >
        <Image src={coverUrl} alt={title} fill sizes="260px" priority className="object-cover" />
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleBookmarkClick}
        disabled={bookmarkMutation.isPending}
        className={cn(
          "absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors",
          bookmarked ? "bg-primary text-primary-foreground" : "bg-black/40 text-white hover:bg-black/60"
        )}
        aria-label={bookmarked ? "Убрать из закладок" : "Добавить в закладки"}
      >
        <Bookmark className={cn("h-[18px] w-[18px]", bookmarked && "fill-current")} />
      </motion.button>
    </div>
  );
}
