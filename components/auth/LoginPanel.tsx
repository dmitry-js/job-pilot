"use client";

import { useActionState } from "react";
import posthog from "posthog-js";
import { isPostHogConfigured } from "@/lib/posthog-config";
import type { AuthActionResult } from "@/types/auth";

type Props = {
  action: (state: AuthActionResult, form: FormData) => Promise<AuthActionResult>;
  configured: boolean;
  initialError?: string;
};

export function LoginPanel({ action, configured, initialError }: Props): React.JSX.Element {
  const [state, formAction, pending] = useActionState(action, { success: false });
  const error = state.error ?? initialError;

  const handleSubmit = (formData: FormData) => {
    const provider = formData.get("provider");
    if ((provider === "google" || provider === "github") && isPostHogConfigured()) {
      posthog.capture("oauth_sign_in_started", { provider });
    }
    return formAction(formData);
  };

  return (
    <section aria-labelledby="login-heading" className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-10">
      <p className="text-xs font-medium tracking-widest text-accent-dark">YOUR NEXT CHAPTER</p>
      <h1 id="login-heading" className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Welcome to JobPilot</h1>
      <p className="mt-4 text-sm leading-6 text-text-secondary">Sign in or create your account to start your job search.</p>
      <form action={handleSubmit} className="mt-8 flex flex-col gap-3" aria-busy={pending}>
        <button type="submit" name="provider" value="google" disabled={!configured || pending} className="min-h-12 rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60">Continue with Google</button>
        <button type="submit" name="provider" value="github" disabled={!configured || pending} className="min-h-12 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60">Continue with GitHub</button>
        {pending && <p role="status" className="text-sm text-text-secondary">Connecting to your sign in provider…</p>}
        {error && <p role="alert" className="text-sm leading-6 text-text-primary">{error}</p>}
        {!configured && <p role="status" className="text-sm leading-6 text-text-secondary">Sign in is not available yet. Please try again later.</p>}
      </form>
      <p className="mt-8 border-t border-border pt-6 text-xs leading-5 text-text-secondary">Use your Google or GitHub account. No new password to remember.</p>
    </section>
  );
}
