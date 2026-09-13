import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "aurora-1": {
          "0%, 100%": { transform: "translate(-10%, -10%) scale(1)" },
          "50%": { transform: "translate(10%, 5%) scale(1.15)" },
        },
        "aurora-2": {
          "0%, 100%": { transform: "translate(10%, 10%) scale(1.1)" },
          "50%": { transform: "translate(-15%, -5%) scale(0.95)" },
        },
        "aurora-3": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(-8%, 12%) scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.5)" },
          "100%": { boxShadow: "0 0 0 24px hsl(var(--primary) / 0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        ripple: {
          from: { transform: "scale(0)", opacity: "0.45" },
          to: { transform: "scale(2.5)", opacity: "0" },
        },
      },
      animation: {
        ripple: "ripple 0.6s ease-out forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "aurora-1": "aurora-1 18s ease-in-out infinite",
        "aurora-2": "aurora-2 22s ease-in-out infinite",
        "aurora-3": "aurora-3 26s ease-in-out infinite",
        shimmer: "shimmer 2s infinite linear",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin-slow 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
