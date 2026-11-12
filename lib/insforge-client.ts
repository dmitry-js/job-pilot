"use client";

import { createBrowserClient } from "@insforge/sdk/ssr";

export function getInsforgeBrowser(): ReturnType<typeof createBrowserClient> {
  return createBrowserClient();
}
