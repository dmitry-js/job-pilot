import "server-only";

import { isPostHogEnabled } from "@/lib/posthog-config";

import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

function getPostHogLogsUrl(): string | undefined {
  if (!isPostHogEnabled() || !posthogProjectToken || !posthogHost) return undefined;

  try {
    return new URL("/i/v1/logs", posthogHost).toString();
  } catch {
    return undefined;
  }
}

const posthogLogsUrl = getPostHogLogsUrl();

export const posthogLogsLoggerProvider = posthogProjectToken && posthogLogsUrl
  ? new LoggerProvider({
      resource: resourceFromAttributes({ "service.name": "job-pilot" }),
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: posthogLogsUrl,
            headers: {
              Authorization: `Bearer ${posthogProjectToken}`,
              "Content-Type": "application/json",
            },
          }),
        }),
      ],
    })
  : undefined;

export function register(): void {
  if (!isPostHogEnabled()) return;
  if (process.env.NODE_ENV !== "production" && !posthogProjectToken) {
    console.warn(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
    );
  }

  if (process.env.NODE_ENV !== "production" && !posthogHost) {
    console.warn(
      "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
    );
  }
}
