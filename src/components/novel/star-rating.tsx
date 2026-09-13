"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = 20,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = Boolean(onChange);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHovered(star)}
          onClick={() => onChange?.(star)}
          className={cn("transition-transform", interactive && "hover:scale-110")}
          aria-label={`${star} из 5`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              "transition-colors",
              star <= display ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
