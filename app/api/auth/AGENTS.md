# Authentication context

## Sources and entry points

- Session design: [docs/specs/0001-auth.md](../../../docs/specs/0001-auth.md). Environment and provider setup: [docs/auth-setup.md](../../../docs/auth-setup.md).
- Use `@insforge/sdk/ssr` for auth clients and actions; use `@insforge/sdk/ssr/middleware` for Proxy refresh. Check the installed SDK version and its actual contract before making integration changes. Fetch current InsForge MCP docs before integration edits, and check the installed SDK contract.
- InsForge MCP is connected. Project library conventions live in [context/library-docs.md](../../../context/library-docs.md).
- `lib/insforge-server.ts` creates a client for each request using awaited Next.js cookies. `lib/insforge-client.ts` exposes `getInsforgeBrowser()` for browser consumers of the existing session. Do not mix these contexts.
- `actions/auth.ts` owns Google/GitHub initiation and sign out. `callback/route.ts` exchanges OAuth codes on the server. `refresh/route.ts` handles browser session refresh.

## Session boundaries

- `lib/auth.ts` verifies identity through InsForge `getCurrentUser()` and exposes `requireUser()`. Protected pages call it before rendering; data operations must verify identity independently and enforce ownership.
- Root `proxy.ts` refreshes sessions and performs early routing checks for dashboard, profile, and find jobs, including descendants. Cookie presence alone is not authorization. Construct forwarded request headers after SDK cookie updates, and copy response cookies to redirects as well as successful responses.
- `APP_URL` is the configured app origin for OAuth callbacks and refresh Origin checks. Do not derive it from the incoming Host header. Backend configuration uses `NEXT_PUBLIC_INSFORGE_URL` and `NEXT_PUBLIC_INSFORGE_ANON_KEY`; never expose provider secrets or admin keys through public variables.
- OAuth uses an httpOnly PKCE verifier cookie with a ten minute lifetime, SameSite=Lax, and Secure in production. The callback requires code and verifier, clears the verifier, and redirects to the fixed `/dashboard` destination on success.
- Let the SDK manage access and refresh cookie names and expiry. The refresh cookie stays httpOnly; the short lived access cookie supports browser SDK calls. Server Actions must not return token responses.
- Sign out clears local auth and verifier cookies and revalidates the root layout. Keep navigation redirects outside action catch blocks.

## Refresh response contract

- POST only, with Origin checked against `APP_URL` before refresh. Keep responses `no-store` and preserve the SDK's Set-Cookie headers for rotation and cleanup.
- Success requires both top level `accessToken` and `user`. This is an SDK protocol exception to the normal response data wrapper. Select these fields explicitly; never spread the complete refresh result or return refresh credentials in JSON.
- Failure preserves the SDK HTTP status and machine readable `error` code, with readable generic prose in `message` and matching `statusCode`. SDK 1.5.2 clears its browser token for 401 `AUTH_UNAUTHORIZED` or `AUTH_TOKEN_EXPIRED`; replacing those codes with prose breaks cleanup. Do not convert backend outages into 401 responses.
- Run `npm run test:auth` from the project root after contract changes. `tests/auth-refresh.test.mjs` exercises the installed SDK with mocked backend fetches, including token adoption, invalid session cleanup, cookie headers, and credential exclusion.

## UI integration

- The homepage verifies the session on the server and passes an `authenticated` boolean to its navigation and CTA components. Keep auth reads out of presentation components.
- Login and sign out controls use Server Actions with pending and generic error states. Dashboard, profile, find jobs, and job details currently contain protected empty states; their presence does not establish completion of later page features.

_Drafted by /sync from the introducing change, worth a quick human pass._
