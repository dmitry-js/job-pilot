# Analytics setup

Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` to the PostHog project token and `NEXT_PUBLIC_POSTHOG_HOST` to that project's ingestion host in `.env.local` and in the deployment environment. Use `https://us.i.posthog.com` for US Cloud or `https://eu.i.posthog.com` for EU Cloud. Do not substitute a personal API key. Both values must be available during the Next.js build and at server runtime; rebuild after changing public environment variables.

Local development analytics is **off by default**, even when the project token and host are configured. To test locally, add `NEXT_PUBLIC_POSTHOG_ENABLE_DEV=true` to `.env.local` and restart the dev server. Only the exact value `true` opts in. This switch covers browser events and exceptions, server events, and OpenTelemetry OAuth logs. Production analytics remains enabled when token and host are configured, regardless of the development switch.

Missing configuration disables analytics without blocking the app. Opted-in development instrumentation reports missing settings. The official setup uses this token name: https://posthog.com/docs/libraries/next-js.

Browser events wait for verified server identity on the rendered page. Pageviews are manual, after reconciliation; events for a changed pathname are dropped until the destination reconciles. Navigation attempts alone do not suspend capture, so query-only, same-URL, and cancelled navigation cannot strand analytics. Identity uses PostHog’s default durable `localStorage+cookie` persistence. Reconciliation resets a stored account only when it differs from the verified session, preserving returning users and anonymous-to-login attribution. The event filter also checks the distinct ID, preventing an identity adopted from another tab from bypassing verification. Session recording is disabled. Signing out suspends capture and resets identity across tabs; those tabs resume tracking when a server-rendered page reconciles identity again.

Use `captureServerEvent` from `lib/posthog-server.ts` for server events with a verified user ID. It creates a request-scoped client and awaits shutdown even when capture fails. The OpenTelemetry OAuth logs are separate.

Validation: `npm run test:analytics`, `npm run test:auth`, `npm run lint`, `npx tsc --noEmit`, and `npm run build -- --webpack`. Tests mock transport and do not send analytics. Live delivery can be checked in PostHog by signing in, navigating, signing out in another tab, and revisiting login after session expiry; anonymous pageviews and sign-in attempts must not carry the former user's ID.

## Identity warning investigation

The installed SDK warns that memory persistence without a stable bootstrap ID generates a new anonymous ID per document; repeated `identify()` calls merge these IDs into a person and can exceed its distinct-ID display limit. Durable persistence fixes that cause. See [PostHog persistence](https://posthog.com/docs/libraries/js/persistence).

The SDK emits “Event '$set' was rejected in beforeSend function” when our local event filter returns null. This message alone is not evidence of an ingestion API rejection. `$set` updates a person profile, so it must not bypass authentication reconciliation. Verified `$identify` and `$set` events pass after reconciliation; pre-verification, unreconciled-destination, and mismatched-identity events remain intentionally blocked. Tests cover these boundaries. No live ingestion failure was reproduced.

Identity-order regression coverage uses the installed browser SDK: `identify(userId)` sets `distinct_id` to `userId` before emitting `$identify`. Authorizing the verified user ID before calling it is intentional and also allows its synchronous profile updates.
