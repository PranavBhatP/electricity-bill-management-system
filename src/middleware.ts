import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = ["/", "/auth/signin", "/auth/signup"];
  
  // Check if the path is a public path
  const isPublicPath = publicPaths.some(pp => path === pp || path.startsWith(pp + "/"));
  
  // If it's a public path and user is logged in, redirect based on role
  if (isPublicPath && token) {
    if (token.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (token.role === "user") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }
  
  // If it's not a public path and user is not logged in, redirect to signin
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  
  // Role-based access control
  if (path.startsWith("/admin") && token?.role !== "admin") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  if (path.startsWith("/user") && token?.role !== "user") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 