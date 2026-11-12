"use server";

import { createAuthActions, clearAuthCookies } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAppOrigin, isOAuthConfigured, OAUTH_VERIFIER_COOKIE } from "@/lib/auth-config";
import type { AuthActionResult } from "@/types/auth";

export async function signIn(_state: AuthActionResult, form: FormData): Promise<AuthActionResult> {
  let destination: string;
  try {
    const provider = form.get("provider");
    if (provider !== "google" && provider !== "github") return { success: false, error: "Choose Google or GitHub to sign in." };
    if (!isOAuthConfigured()) return { success: false, error: "Sign in is not available yet. Please try again later." };
    const cookieStore = await cookies();
    const auth = createAuthActions({ cookies: cookieStore });
    const { data, error } = await auth.signInWithOAuth(provider, {
      redirectTo: new URL("/api/auth/callback", getAppOrigin()).toString(),
      skipBrowserRedirect: true,
    });
    if (error || !data?.url || !data.codeVerifier) {
      console.error("[auth/signIn] OAuth initialization failed");
      return { success: false, error: "We couldn’t connect to your sign in provider. Please try again." };
    }
    const url = new URL(data.url);
    if (url.protocol !== "https:") throw new Error("Invalid provider URL");
    cookieStore.set(OAUTH_VERIFIER_COOKIE, data.codeVerifier, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600,
    });
    destination = url.toString();
  } catch {
    console.error("[auth/signIn] Unable to start OAuth");
    return { success: false, error: "Sign in couldn’t start. Please try again." };
  }
  redirect(destination);
}

export async function signOut(): Promise<AuthActionResult> {
  try {
    const cookieStore = await cookies();
    try {
      const auth = createAuthActions({ cookies: cookieStore });
      await auth.signOut();
    } finally {
      clearAuthCookies(cookieStore);
      cookieStore.delete(OAUTH_VERIFIER_COOKIE);
    }
    revalidatePath("/", "layout");
  } catch {
    console.error("[auth/signOut] Unable to complete sign out");
    return { success: false, error: "Sign out couldn’t finish. Please try again." };
  }
  redirect("/login");
}
