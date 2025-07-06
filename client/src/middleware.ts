import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/signin", "/signup"];

const isPublicRoute = (pathname: string) =>
  publicRoutes.some((route) => pathname.startsWith(route));

const isProtectedRoute = (pathname: string) =>
  protectedRoutes.some((route) => pathname.startsWith(route));

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const session = await getSession();

  if (!session?.userId && isProtectedRoute(pathname)) {
    // If the user is not authenticated and trying to access a protected route, redirect to sign-in
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (session?.userId && isPublicRoute(pathname)) {
    // If the user is authenticated and trying to access a public route, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
