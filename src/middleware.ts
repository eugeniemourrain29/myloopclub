import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  // Protected routes
  const protectedPaths = [
    "/dashboard",
    "/events",
    "/propose",
  ];

  // Auth routes — redirect away if already logged in
  const authPaths = ["/auth/signin", "/auth/signup"];

  const isProtected = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  // Propose page: redirect to sign-in if not logged in
  if (nextUrl.pathname.startsWith("/propose") && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=/propose`, nextUrl)
    );
  }

  // Dashboard: require auth
  if (nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }

  // Already logged in, trying to access auth pages
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
