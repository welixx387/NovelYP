"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, History, LogOut, Settings, Sparkles } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-auth-actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Войти</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">Регистрация</Link>
        </Button>
      </div>
    );
  }

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
          {getInitials(user.name)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Settings className="h-4 w-4" /> Личный кабинет
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/bookmarks">
            <Bookmark className="h-4 w-4" /> Закладки
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/history">
            <History className="h-4 w-4" /> История чтения
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/subscription">
            <Sparkles className="h-4 w-4" /> Подписка
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="h-4 w-4" /> Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
