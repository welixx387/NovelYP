import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

// Middleware всегда работает в Edge runtime, поэтому здесь нельзя обращаться к Prisma —
// только быстрая проверка JWT из cookie. Проверка активной подписки (требует БД)
// выполняется отдельно, уже в серверных компонентах/route-хендлерах Node runtime.
const PROTECTED_PREFIXES = ["/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
