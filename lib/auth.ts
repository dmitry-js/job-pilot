import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_ACCESS_TOKEN_COOKIE } from "@insforge/sdk/ssr";
import { createInsforgeServer } from "@/lib/insforge-server";
import { isInsforgeConfigured } from "@/lib/auth-config";

type AuthUser = { id: string; email: string };

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  if (!isInsforgeConfigured() || !cookieStore.get(DEFAULT_ACCESS_TOKEN_COOKIE)?.value) return null;
  try {
    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email };
  } catch {
    console.error("[auth/getCurrentUser] Session verification failed");
    return null;
  }
});

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
