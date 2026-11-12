import { createAuthActions, clearAuthCookies } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getAppOrigin, OAUTH_VERIFIER_COOKIE } from "@/lib/auth-config";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const origin = getAppOrigin();
    const failure = NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
    failure.headers.set("Cache-Control", "no-store");
    failure.headers.set("Referrer-Policy", "no-referrer");
    failure.cookies.delete(OAUTH_VERIFIER_COOKIE);
    const code = request.nextUrl.searchParams.get("insforge_code");
    const verifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
    if (request.nextUrl.searchParams.has("error") || !code || code.length > 4096 || !verifier) return failure;

    const response = NextResponse.redirect(new URL("/dashboard", origin));
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    const auth = createAuthActions({ requestCookies: request.cookies, responseCookies: response.cookies });
    const { data, error } = await auth.exchangeOAuthCode(code, verifier);
    if (error || !data?.user) {
      clearAuthCookies(failure.cookies);
      console.error("[auth/callback] OAuth exchange failed");
      return failure;
    }
    response.cookies.delete(OAUTH_VERIFIER_COOKIE);
    return response;
  } catch {
    console.error("[auth/callback] Unable to complete OAuth");
    const response = new NextResponse(null, { status: 303, headers: { Location: "/login?error=oauth_failed", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
    response.cookies.delete(OAUTH_VERIFIER_COOKIE);
    return response;
  }
}
