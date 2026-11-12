"use client";

import NextError from "next/error";
import posthog from "posthog-js";
import { isPostHogConfigured } from "@/lib/posthog-config";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isPostHogConfigured()) {
      posthog.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
