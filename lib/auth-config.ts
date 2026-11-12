export const OAUTH_VERIFIER_COOKIE = "insforge_code_verifier";

export function isInsforgeConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_INSFORGE_URL && process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY);
}

export function getAppOrigin(): string {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL is required for authentication");
  const url = new URL(value);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (url.protocol !== "https:" && !(local && url.protocol === "http:" && process.env.NODE_ENV !== "production"))) {
    throw new Error("APP_URL must be a secure app origin (HTTP localhost is allowed in development)");
  }
  return url.origin;
}

export function isOAuthConfigured(): boolean {
  if (!isInsforgeConfigured()) return false;
  try {
    getAppOrigin();
    return true;
  } catch {
    return false;
  }
}
