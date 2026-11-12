import { refreshAuth } from "@insforge/sdk/ssr";
import { getAppOrigin } from "@/lib/auth-config";

export async function POST(request: Request): Promise<Response> {
  try {
    if (request.headers.get("origin") !== getAppOrigin()) {
      return Response.json({ success: false, error: "FORBIDDEN", message: "Request not allowed.", statusCode: 403 }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    const result = await refreshAuth({ request });
    const headers = new Headers(result.response.headers);
    headers.set("Cache-Control", "no-store");
    if (result.error) {
      const status = result.response.status;
      return Response.json({
        success: false,
        error: result.error.error,
        message: status === 401 ? "Please sign in again." : "Unable to refresh your session.",
        statusCode: status,
      }, { status, headers });
    }
    // The browser SSR client requires both fields at the top level. Never spread the token-bearing result.
    return Response.json({ success: true, accessToken: result.accessToken, user: result.data?.user }, { headers });
  } catch {
    console.error("[auth/refresh] Session refresh failed");
    return Response.json({ success: false, error: "INTERNAL_SERVER_ERROR", message: "Unable to refresh your session.", statusCode: 500 }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
