import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/tests") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/planner") ||
    pathname.startsWith("/bookmarks") ||
    pathname.startsWith("/mock-tests") ||
    pathname.startsWith("/exam") ||
    pathname.startsWith("/results") ||
    pathname.startsWith("/mistakes") ||
    pathname.startsWith("/study-planner") ||
    pathname.startsWith("/ai-assistant") ||
    pathname.startsWith("/subscription");

  const isAdminRoute = pathname.startsWith("/admin");

  // Unauthenticated user trying to access protected student routes
  if (isProtectedRoute && !sessionCookie) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // Unauthenticated user trying to access admin routes
  if (isAdminRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/tests/:path*",
    "/practice/:path*",
    "/analytics/:path*",
    "/planner/:path*",
    "/bookmarks/:path*",
    "/mock-tests/:path*",
    "/exam/:path*",
    "/results/:path*",
    "/mistakes/:path*",
    "/study-planner/:path*",
    "/ai-assistant/:path*",
    "/subscription/:path*",
    "/admin/:path*",
  ],
};
