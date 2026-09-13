"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)] hover:brightness-110",
        secondary:
          "bg-secondary text-secondary-foreground bg-muted hover:bg-accent",
        outline:
          "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onPointerDown, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const ripple: Ripple = {
        id: Date.now(),
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      };
      setRipples((prev) => [...prev, ripple]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
      onPointerDown?.(event);
    }

    // Slot (asChild) требует РОВНО одного React-элемента в children — даже "false" в
    // качестве второго ребёнка ломает его, поэтому здесь не два JSX-ветвления, а две ветки return.
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          onPointerDown={handlePointerDown}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-white/40 animate-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
