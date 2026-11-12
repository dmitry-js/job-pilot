"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { reconcileAnalyticsIdentity, suspendAnalytics } from "@/lib/posthog-client";

type Props = { userId: string | null; email?: string };

export function AnalyticsIdentity({ userId, email }: Props): null {
  const pathname = usePathname();
  useEffect(() => {
    reconcileAnalyticsIdentity(userId, email);
    return suspendAnalytics;
  }, [userId, email, pathname]);
  return null;
}
