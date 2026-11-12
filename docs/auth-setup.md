# Auth setup

JobPilot uses InsForge SDK 1.5.2 SSR helpers. Google and GitHub OAuth begin in a Server Action, return to `/api/auth/callback`, and finish on `/dashboard`. The refresh token is kept in an httpOnly app cookie. Next.js 16 `proxy.ts` refreshes sessions; protected pages independently verify the user with InsForge.

## Environment

Local development uses the ignored `.env.local` file. The implementation created it only because no file existed, using the connected backend's public anon key.

```dotenv
NEXT_PUBLIC_INSFORGE_URL=https://v54mg544.eu-central.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=<public anon key from InsForge>
APP_URL=http://localhost:3000
```

Use the exact APP_URL origin in the browser. If you use a different local port, update APP_URL and the allowed callback URL together. Production requires an HTTPS APP_URL. Set these three variables on your hosting provider; the two NEXT_PUBLIC variables must also be present at build time. Never put a provider client secret or InsForge admin key in NEXT_PUBLIC variables.

## InsForge dashboard

The connected backend reports Google and GitHub enabled. Both authorization handoffs were verified to reach the respective providers. No provider credential change was needed to start OAuth.

The backend reports an empty `allowedRedirectUrls` list. In the project's authentication settings, add exact allowed redirects:

- `http://localhost:3000/api/auth/callback`
- `https://<your-production-domain>/api/auth/callback`

If you use custom Google/GitHub OAuth applications, confirm the client ID and client secret in InsForge's Auth Methods settings and copy the **backend provider callback URL shown by InsForge** into the provider's authorized callback settings. This is different from JobPilot's `/api/auth/callback`: the provider returns to InsForge first; InsForge then returns to JobPilot. Do not guess the backend callback URL or store provider secrets in this repository.

## Live verification still required

1. Open `/login` at the configured APP_URL and complete Google consent. Expect `/dashboard`, with the account email displayed.
2. Reload and navigate between Dashboard, Profile, and Find Jobs. Expect the session to persist.
3. Sign out, then revisit each protected route, including `/find-jobs/example`. Expect `/login`.
4. Repeat with GitHub and check cancellation returns a readable login error.

Provider consent requires the user's account and was not completed by the agent. Successful callback, refresh, and logout paths are also checked against a controlled backend fixture, which does not substitute for these live provider checks.

## Implementation notes

- Run `npm run test:auth` with Node.js 22.15+ for the refresh contract regression suite. It uses the installed SDK and mocks only backend fetches; no live account or credentials are needed. The test loader resolves the app alias without changing Next.js configuration.

- `/api/auth/refresh` is POST only and checks Origin against APP_URL.
- The callback is a Route Handler under `app/api/`, replacing the planned callback page because Server Components cannot write cookies.
- Login and logout use Server Actions. No tokens are returned from those actions.
- The SDK's short-lived access cookie is browser-readable for future Storage/Realtime; its refresh cookie is httpOnly. Cookies use SameSite=Lax and Secure in production.
- Proxy cookie presence is an early routing check only. Future data operations must call `requireUser()` or verify with InsForge themselves, then enforce user ownership.
- Dashboard, Profile, Find Jobs, and Job Details currently contain protected empty states. Their full features remain pending in the build plan.
