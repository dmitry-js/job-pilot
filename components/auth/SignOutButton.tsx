"use client";

import { useActionState } from "react";
import posthog from "posthog-js";
import { isPostHogConfigured } from "@/lib/posthog-config";
import { resetAnalyticsIdentity } from "@/lib/posthog-client";
import { signOut } from "@/actions/auth";

export function SignOutButton(): React.JSX.Element {
  const [state, action, pending] = useActionState(signOut, { success: false });

  const resetPostHog = () => {
    if (isPostHogConfigured()) {
      posthog.capture("user_signed_out");
      resetAnalyticsIdentity();
    }
  };

  return (
    <form action={action} onSubmit={resetPostHog} className="flex flex-col items-end gap-2">
      <button disabled={pending} className="min-h-11 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-60">{pending ? "Signing out…" : "Sign out"}</button>
      {state.error && <p role="alert" className="text-xs text-text-secondary">{state.error}</p>}
    </form>
  );
}
