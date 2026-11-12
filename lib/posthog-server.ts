import "server-only";

import { PostHog } from "posthog-node";
import { isPostHogConfigured } from "@/lib/posthog-config";

type ServerEvent = {
  userId: string;
  event: string;
  properties?: Record<string, unknown>;
};

export function createPostHogServer(): PostHog | null {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!isPostHogConfigured() || !token || !host) return null;
  return new PostHog(token, {
    host,
    flushAt: 1,
    flushInterval: 0,
    requestTimeout: 2000,
    fetchRetryCount: 0,
  });
}

export async function captureServerEvent({ userId, event, properties }: ServerEvent): Promise<void> {
  const client = createPostHogServer();
  if (!client) return;
  try {
    client.capture({ distinctId: userId, event, properties: { ...properties, userId } });
  } catch {
    console.warn("[posthog] Server event capture failed");
  } finally {
    try {
      await client.shutdown(2000);
    } catch {
      console.warn("[posthog] Server event flush failed");
    }
  }
}
