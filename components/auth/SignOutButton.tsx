"use client";

import { useActionState } from "react";
import { signOut } from "@/actions/auth";

export function SignOutButton(): React.JSX.Element {
  const [state, action, pending] = useActionState(signOut, { success: false });
  return (
    <form action={action} className="flex flex-col items-end gap-2">
      <button disabled={pending} className="min-h-11 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-60">{pending ? "Signing out…" : "Sign out"}</button>
      {state.error && <p role="alert" className="text-xs text-text-secondary">{state.error}</p>}
    </form>
  );
}
