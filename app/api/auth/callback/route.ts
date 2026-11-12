import { createAuthActions, clearAuthCookies } from "@insforge/sdk/ssr";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { after, NextRequest, NextResponse } from "next/server";
import { posthogLogsLoggerProvider } from "@/instrumentation";
import { getAppOrigin, OAUTH_VERIFIER_COOKIE } from "@/lib/auth-config";

const posthogLogger = posthogLogsLoggerProvider?.getLogger("job-pilot.posthog-logs");

function flushPostHogLogs(): void {
  const provider = posthogLogsLoggerProvider;
  if (!provider) return;

  after(async () => {
    await provider.forceFlush().catch(() => {});
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const origin = getAppOrigin();
    const failure = NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
    failure.headers.set("Cache-Control", "no-store");
    failure.headers.set("Referrer-Policy", "no-referrer");
    failure.cookies.delete(OAUTH_VERIFIER_COOKIE);
    const code = request.nextUrl.searchParams.get("insforge_code");
    const verifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;
    if (request.nextUrl.searchParams.has("error") || !code || code.length > 4096 || !verifier) {
      posthogLogger?.emit({
        body: "OAuth callback rejected",
        severityNumber: SeverityNumber.WARN,
        attributes: { outcome: "rejected" },
      });
      flushPostHogLogs();
      return failure;
    }

    const response = NextResponse.redirect(new URL("/dashboard", origin));
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    const auth = createAuthActions({ requestCookies: request.cookies, responseCookies: response.cookies });
    const { data, error } = await auth.exchangeOAuthCode(code, verifier);
    if (error || !data?.user) {
      clearAuthCookies(failure.cookies);
      console.error("[auth/callback] OAuth exchange failed");
      posthogLogger?.emit({
        body: "OAuth callback exchange failed",
        severityNumber: SeverityNumber.WARN,
        attributes: { outcome: "exchange_failed" },
      });
      flushPostHogLogs();
      return failure;
    }
    response.cookies.delete(OAUTH_VERIFIER_COOKIE);
    posthogLogger?.emit({
      body: "OAuth callback completed",
      severityNumber: SeverityNumber.INFO,
      attributes: { outcome: "completed" },
    });
    flushPostHogLogs();
    return response;
  } catch {
    console.error("[auth/callback] Unable to complete OAuth");
    posthogLogger?.emit({
      body: "OAuth callback could not complete",
      severityNumber: SeverityNumber.ERROR,
      attributes: { outcome: "unexpected_failure" },
    });
    flushPostHogLogs();
    const response = new NextResponse(null, { status: 303, headers: { Location: "/login?error=oauth_failed", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
    response.cookies.delete(OAUTH_VERIFIER_COOKIE);
    return response;
  }
}
