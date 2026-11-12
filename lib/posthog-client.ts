import posthog from "posthog-js";
import { isPostHogEnabled, isPostHogConfigured } from "@/lib/posthog-config";

export const ANALYTICS_SIGN_OUT = "jobpilot:analytics-sign-out";
let verifiedPath: string | null = null;
let verifiedDistinctId: string | null = null;

export function suspendAnalytics(): void {
  verifiedPath = null;
  verifiedDistinctId = null;
}

export function initPostHog(): void {
  if (!isPostHogEnabled()) return;
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[posthog] ${!token ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN" : "NEXT_PUBLIC_POSTHOG_HOST"} is missing; analytics is disabled`);
    }
    return;
  }

  posthog.init(token, {
    api_host: host,
    defaults: "2026-08-30",
    persistence: "localStorage+cookie",
    capture_pageview: false,
    capture_exceptions: true,
    disable_session_recording: true,
    before_send: (event) => verifiedPath === window.location.pathname &&
      event?.properties.distinct_id === verifiedDistinctId ? event : null,
    debug: process.env.NODE_ENV === "development",
  });
  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key === ANALYTICS_SIGN_OUT) resetAnalyticsIdentity(false);
  });
}

export function reconcileAnalyticsIdentity(userId: string | null, email?: string): void {
  if (!isPostHogConfigured()) return;
  const path = window.location.pathname;
  const persistedUserId = posthog.get_property("$user_id") ?? null;
  if (persistedUserId === userId && verifiedPath === path && verifiedDistinctId === posthog.get_distinct_id()) return;

  suspendAnalytics();
  // Preserve anonymous attribution and returning users; reset only a different known account.
  if (persistedUserId && persistedUserId !== userId) posthog.reset();
  // identify() emits synchronously with userId as distinct_id, so authorize that ID first.
  verifiedDistinctId = userId ?? posthog.get_distinct_id();
  verifiedPath = path;
  if (userId) posthog.identify(userId, email ? { email } : undefined);
  posthog.capture("$pageview");
}

export function resetAnalyticsIdentity(broadcast: boolean = true): void {
  if (!isPostHogConfigured()) return;
  suspendAnalytics();
  posthog.reset();
  if (broadcast) {
    try {
      localStorage.setItem(ANALYTICS_SIGN_OUT, crypto.randomUUID());
    } catch {
      console.warn("[posthog] Cross-tab identity reset is unavailable");
    }
  }
}
