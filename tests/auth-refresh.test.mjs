import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { after, afterEach, beforeEach, mock, test } from "node:test";
import { createBrowserClient } from "@insforge/sdk/ssr";

// Resolve the app alias without changing its Next.js/TypeScript configuration.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const { POST } = await import("../app/api/auth/refresh/route.ts");
after(() => hooks.deregister());

const origin = "https://jobpilot.example";
const backend = "https://insforge.example";
const user = { id: "user-1", email: "user@example.test" };
const token = (exp) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.fixture`;
const accessToken = token(Math.floor(Date.now() / 1000) + 3600);
const refreshToken = token(Math.floor(Date.now() / 1000) + 86400);
let previousEnv;

beforeEach(() => {
  previousEnv = { ...process.env };
  process.env.APP_URL = origin;
  process.env.NEXT_PUBLIC_INSFORGE_URL = backend;
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY = "fixture-anon-key";
});
afterEach(() => {
  mock.restoreAll();
  process.env = previousEnv;
});

function request({ requestOrigin = origin, cookie = `insforge_refresh_token=${refreshToken}` } = {}) {
  const headers = new Headers({ cookie });
  if (requestOrigin !== null) headers.set("Origin", requestOrigin);
  return new Request(`${origin}/api/auth/refresh`, { method: "POST", headers });
}

function backendResponse(body, status = 200) {
  return mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, `${backend}/api/auth/refresh?client_type=mobile`);
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { refresh_token: refreshToken });
    return Response.json(body, { status });
  });
}

function assertClearedCookies(response) {
  const cookies = response.headers.getSetCookie();
  for (const name of ["insforge_access_token", "insforge_refresh_token"]) {
    assert.ok(cookies.some((cookie) => cookie.startsWith(`${name}=;`) && /Max-Age=0/i.test(cookie)));
  }
}

test("refresh returns the SDK success contract and rotates cookies without exposing refresh credentials", async () => {
  backendResponse({ accessToken, user, refreshToken, csrfToken: "csrf-fixture" });
  const response = await POST(request());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(body.accessToken, accessToken);
  assert.deepEqual(body.user, user);
  assert.equal(body.refreshToken, undefined);
  assert.equal(body.refresh_token, undefined);
  assert.ok(!JSON.stringify(body).includes(refreshToken));
  const cookies = response.headers.getSetCookie();
  assert.ok(cookies.some((cookie) => cookie.startsWith(`insforge_access_token=${accessToken};`)));
  assert.ok(cookies.some((cookie) => cookie.startsWith(`insforge_refresh_token=${refreshToken};`) && /HttpOnly/i.test(cookie)));
});

for (const code of ["AUTH_UNAUTHORIZED", "AUTH_TOKEN_EXPIRED"]) {
  test(`refresh preserves ${code}, its status, and cookie cleanup while sanitizing messages`, async () => {
    backendResponse({ error: code, statusCode: 401, message: `private backend detail ${refreshToken}` }, 401);
    const response = await POST(request());
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.error, code);
    assert.equal(body.statusCode, 401);
    assert.equal(typeof body.message, "string");
    assert.ok(!JSON.stringify(body).includes("private backend detail"));
    assert.ok(!JSON.stringify(body).includes(refreshToken));
    assert.equal(response.headers.get("cache-control"), "no-store");
    assertClearedCookies(response);
  });
}

test("missing refresh cookie yields SDK AUTH_UNAUTHORIZED and clears cookies without a backend call", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected backend call"); });
  const response = await POST(request({ cookie: "" }));
  const body = await response.json();
  assert.equal(response.status, 401);
  assert.equal(body.error, "AUTH_UNAUTHORIZED");
  assert.equal(fetch.mock.callCount(), 0);
  assertClearedCookies(response);
});

test("backend outages remain server errors rather than becoming invalid-session 401 responses", async () => {
  backendResponse({ error: "SERVICE_UNAVAILABLE", statusCode: 503, message: "private backend detail" }, 503);
  const response = await POST(request());
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.statusCode, 503);
  assert.equal(body.error, "SERVICE_UNAVAILABLE");
  assert.notEqual(body.message, "private backend detail");
  assertClearedCookies(response);
});

test("foreign or missing Origin is rejected before invoking the backend", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected backend call"); });
  for (const requestOrigin of ["https://foreign.example", null]) {
    const response = await POST(request({ requestOrigin }));
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("unexpected configuration errors return a generic machine-readable 500 response", async () => {
  delete process.env.APP_URL;
  mock.method(console, "error", () => {});
  const response = await POST(request());
  const body = await response.json();
  assert.equal(response.status, 500);
  assert.equal(body.error, "INTERNAL_SERVER_ERROR");
  assert.equal(body.statusCode, 500);
  assert.equal(typeof body.message, "string");
  assert.ok(!JSON.stringify(body).includes("APP_URL"));
});

test("the installed browser SDK adopts the token returned by the app refresh route", async () => {
  backendResponse({ accessToken, user, refreshToken });
  let finishRefresh;
  const refreshed = new Promise((resolve) => { finishRefresh = resolve; });
  const client = createBrowserClient({ baseUrl: backend, anonKey: "fixture", fetch: async (url) => {
    assert.equal(url, "/api/auth/refresh");
    const response = await POST(request());
    finishRefresh();
    return response;
  } });
  const setAccessToken = mock.method(client, "setAccessToken");
  await refreshed;
  await new Promise((resolve) => setImmediate(resolve));
  assert.ok(setAccessToken.mock.calls.some(({ arguments: args }) => args[0] === accessToken));
});

for (const code of ["AUTH_UNAUTHORIZED", "AUTH_TOKEN_EXPIRED"]) {
  test(`the installed browser SDK clears its in-memory token on ${code}`, async () => {
    backendResponse({ error: code, statusCode: 401, message: "Expired session" }, 401);
    let finishRefresh;
    const refreshed = new Promise((resolve) => { finishRefresh = resolve; });
    const client = createBrowserClient({ baseUrl: backend, anonKey: "fixture", fetch: async () => {
      const response = await POST(request());
      finishRefresh();
      return response;
    } });
    client.setAccessToken(accessToken);
    const setAccessToken = mock.method(client, "setAccessToken");
    await refreshed;
    await new Promise((resolve) => setImmediate(resolve));
    assert.ok(setAccessToken.mock.calls.some(({ arguments: args }) => args[0] === null));
  });
}
