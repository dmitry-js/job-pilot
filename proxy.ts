import { updateSession } from "@insforge/sdk/ssr/middleware";
import { NextRequest, NextResponse } from "next/server";
import { isInsforgeConfigured } from "@/lib/auth-config";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const protectedRoute = ["/dashboard", "/profile", "/find-jobs"].some((route) => path === route || path.startsWith(`${route}/`));
  const cookieResponse = NextResponse.next();
  let hasSession = false;
  try {
    if (isInsforgeConfigured()) {
      const session = await updateSession({ requestCookies: request.cookies, responseCookies: cookieResponse.cookies });
      hasSession = Boolean(session.accessToken);
    }
  } catch {
    console.error("[auth/proxy] Session refresh failed");
  }
  // Build forwarding headers after updateSession mutates the incoming cookies.
  const response = protectedRoute && !hasSession
    ? NextResponse.redirect(new URL("/login", request.url))
    : NextResponse.next({ request: { headers: request.headers } });
  for (const cookie of cookieResponse.cookies.getAll()) response.cookies.set(cookie);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/profile/:path*", "/find-jobs/:path*"],
};
