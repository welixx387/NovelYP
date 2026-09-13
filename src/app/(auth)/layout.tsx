import Link from "next/link";
import { BookMarked } from "lucide-react";
import { AuroraBackground } from "@/components/landing/aurora-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <AuroraBackground />
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <BookMarked className="h-6 w-6 text-primary" />
          Ranobe Reader
        </Link>
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-xl backdrop-blur-md">
          {children}
        </div>
      </div>
    </div>
  );
}
