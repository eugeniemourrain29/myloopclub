import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Check for session cookie (NextAuth v5 uses "authjs.session-token" or "next-auth.session-token")
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Protect dashboard and propose
  if (nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }

  if (nextUrl.pathname.startsWith("/propose") && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=/propose`, nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/propose"],
};
