import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Extract subdomain
  let subdomain = "";
  let domain = hostname;

  const parts = hostname.split(".");

  if (parts.length > 2 || (parts.length === 2 && !hostname.includes("localhost"))) {
    subdomain = parts[0];
    domain = parts.slice(1).join(".");
  }

  // Handle localhost for development
  if (hostname.includes("localhost")) {
    const query = request.nextUrl.searchParams.get("tenant");
    if (query) {
      subdomain = query;
    }
  }

  // Skip middleware for auth routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Skip middleware for public routes
  if (pathname === "/" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // If no subdomain, redirect to auth/signin or home
  if (!subdomain) {
    if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    return NextResponse.next();
  }

  // Get tenant from database
  let tenant;
  try {
    tenant = await db.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  } catch (error) {
    console.error("Tenant lookup error:", error);
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Create response and add tenant headers
  const response = NextResponse.next();

  response.headers.set("x-tenant-id", tenant.id);
  response.headers.set("x-subdomain", subdomain);
  response.headers.set("x-plan", tenant.plan);
  response.headers.set("x-domain", domain);

  return response;
}
