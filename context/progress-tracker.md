# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 1, Foundation
**Last completed:** 01 Homepage UI, built from the supplied landing page design.
**In progress:** 02 Auth implemented; live Google/GitHub consent verification remains.
**Next:** Complete the provider checks in `docs/auth-setup.md`, then 03 PostHog Initialization.

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage UI (session aware CTAs now connected)
- [ ] 02 Auth — implementation and automated checks complete; awaiting live provider consent
- [ ] 03 PostHog Initialization
- [ ] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- The homepage follows `context/designs/landing-page.png`, including dark CTA buttons, open grid sections, pastel backgrounds, and the supplied demonstration copy. These are homepage specific exceptions to the general app card and button rules.
- Existing PNGs in `public` provide the logo, dashboard preview, jobs table, agent log, and portrait. The preview content is illustrative, not live application functionality.
- Homepage CTAs link to `/login` and `/find-jobs`; navigation links target the planned app routes. Session aware routing belongs to the Auth feature. `/privacy` and `/terms` are linked as shown in the reference but do not yet have page content.

---

## Notes

- Verification: ESLint passed without warnings; production build passed with `npm run build -- --webpack`. Default Turbopack build was blocked by worker port permissions in this environment.
- Chrome checks at 1440px and 390px confirmed all images load, Inter is applied, one primary heading is present, and there is no horizontal overflow. Desktop and mobile screenshots were inspected.
- `/imprint` is referenced in AGENTS.md but no installed skill file was found. Component patterns are captured directly in `context/ui-registry.md`.
- Next.js pages and layouts retain the default exports required by the installed framework; reusable components use named exports.

## Auth implementation, 2026-10-17

- Session decision recorded before implementation in `docs/specs/0001-auth.md`. Uses official `@insforge/sdk/ssr` helpers from SDK 1.5.2; stale auth examples in library-docs.md were updated.
- Login supports Google/GitHub, pending and error states. OAuth starts in a Server Action, exchanges in `/api/auth/callback`, and redirects to `/dashboard`. Refresh uses app cookies, with an httpOnly refresh token and a short-lived browser-readable access token.
- Next.js 16 `proxy.ts` refreshes cookies before rendering; protected pages verify identity with InsForge independently. Protected empty states exist for dashboard, profile, find jobs, and job details. Full page features remain unchecked above.
- Homepage Get Started and Start for free now reflect the verified session. Logout clears local cookies and revalidates the app layout.
- Added ignored `.env.local` only because none existed. Configuration and manual provider steps are in `docs/auth-setup.md`. Backend reports Google/GitHub enabled and an empty redirect allowlist; both provider authorization handoffs were reached successfully, without completing personal account consent.
- Verification: ESLint and production webpack build passed. Login visually inspected at 1440px and 390px with no horizontal overflow. Real browser checks passed for anonymous redirects on all four protected routes, callback errors, cross-origin refresh rejection, and both provider handoffs.
- Controlled backend fixture passed callback success/cookie flags, mismatched verifier rejection, forged token rejection, refresh forwarding to current request and browser, invalid refresh cleanup, backend user verification, refresh JSON excluding refresh credentials, and logout. These checks do not replace live OAuth consent verification.
- Existing user changes to AGENTS.md were preserved. Tailwind v4 and existing Next.js configuration were retained.

## Auth refresh review fix, 2026-10-18

- Confirmed against installed SDK 1.5.2 (`dist/ssr.mjs`, browser refresh consumer and `refreshAuth`) and its SDK-REFERENCE.md, with auth docs refreshed through MCP: success requires both `accessToken` and `user`; 401 cleanup requires `AUTH_UNAUTHORIZED` or `AUTH_TOKEN_EXPIRED` in `error`.
- Refresh responses now include `user`, preserve SDK error codes and HTTP statuses, keep generic prose in `message`, and retain cookie headers and no-store caching. Refresh credentials remain excluded from JSON.
- Added `tests/auth-refresh.test.mjs` and `npm run test:auth` using Node's built-in runner, with real installed SDK helpers and mocked backend fetches. Tests reproduced the contract failures before the fix. All 10 pass, including browser token adoption and invalid-session cleanup, credential exclusion, cookie rotation/deletion, missing cookies, origin rejection, backend outages, and unexpected errors.
- Validation passed: `npm run test:auth`, `npm run lint`, `npx tsc --noEmit`, and `npm run build -- --webpack`. No commit made. Live provider consent verification remains pending as recorded above.
