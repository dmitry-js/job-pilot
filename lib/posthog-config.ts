export function isPostHogEnabled(): boolean {
  return process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_POSTHOG_ENABLE_DEV === "true";
}

export function isPostHogConfigured(): boolean {
  return isPostHogEnabled() && Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST);
}
