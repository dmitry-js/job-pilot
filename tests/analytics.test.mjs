import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { after, afterEach, mock, test } from "node:test";
import posthogModule from "posthog-js";
import { gunzipSync } from "node:zlib";
import { PostHog } from "posthog-node";

const posthog = posthogModule.posthog;
// Match the singleton default export selected by the Next.js bundler.
const browserSdk = "data:text/javascript," + encodeURIComponent(`import sdk from ${JSON.stringify(import.meta.resolve("posthog-js"))}; export default sdk.posthog;`);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    if (specifier === "posthog-js") return { url: browserSdk, shortCircuit: true };
    if (specifier === "server-only") return { url: "data:text/javascript,export{}", shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
const { initPostHog, reconcileAnalyticsIdentity, resetAnalyticsIdentity, suspendAnalytics, ANALYTICS_SIGN_OUT } = await import("../lib/posthog-client.ts");
const { createPostHogServer, captureServerEvent } = await import("../lib/posthog-server.ts");
const previousEnv = { ...process.env };
after(() => hooks.deregister());
afterEach(() => {
  mock.timers.reset();
  mock.restoreAll();
  process.env = { ...previousEnv };
  delete globalThis.window;
  delete globalThis.localStorage;
});

function configure() {
  process.env.NODE_ENV = "production";
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "test-project-token";
  process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://analytics.example";
}

function browser(persistedIdentity = "previous-user", persistedUser = "previous-user") {
  configure();
  let config;
  let identity = persistedIdentity;
  let userId = persistedUser;
  let anonymous = 0;
  const events = [];
  const listeners = {};
  globalThis.window = {
    location: { pathname: "/login" },
    addEventListener(name, handler) { listeners[name] = handler; },
  };
  globalThis.localStorage = { setItem: mock.fn() };
  mock.method(posthog, "init", (_token, options) => {
    config = options;
  });
  mock.method(posthog, "get_distinct_id", () => identity);
  mock.method(posthog, "get_property", (key) => key === "$user_id" ? userId : undefined);
  mock.method(posthog, "reset", () => { identity = `anonymous-${++anonymous}`; userId = null; });
  mock.method(posthog, "identify", (id) => {
    const event = identity === id ? "$set" : "$identify";
    identity = id;
    userId = id;
    posthog.capture(event);
  });
  mock.method(posthog, "capture", (event) => {
    const result = config.before_send({ event, properties: { distinct_id: identity } });
    if (result) events.push(result);
  });
  suspendAnalytics();
  initPostHog();
  return { events, listeners, config, changeIdentity: (id) => { identity = id; userId = id; } };
}

test("fresh anonymous document gates early events and never adopts the previous user", () => {
  const { events, config } = browser();
  assert.equal(config.capture_pageview, false);
  assert.equal(config.persistence, "localStorage+cookie");
  posthog.capture("early-pageview");
  assert.equal(events.length, 0);
  reconcileAnalyticsIdentity(null);
  posthog.capture("oauth_sign_in_started");
  assert.deepEqual(events.map((e) => e.event), ["$pageview", "oauth_sign_in_started"]);
  assert.ok(events.every((e) => e.properties.distinct_id.startsWith("anonymous-")));
});

test("expired or revoked session resets identity before login pageview and sign-in", () => {
  const { events } = browser();
  window.location.pathname = "/dashboard";
  reconcileAnalyticsIdentity("user-a", "a@example.test");
  assert.equal(events.at(-1).properties.distinct_id, "user-a");
  suspendAnalytics();
  posthog.capture("during-navigation");
  window.location.pathname = "/login";
  posthog.capture("before-login-hydration");
  reconcileAnalyticsIdentity(null);
  posthog.capture("oauth_sign_in_started");
  assert.equal(events.length, 4);
  assert.ok(events.slice(2).every((e) => e.properties.distinct_id.startsWith("anonymous-")));
  reconcileAnalyticsIdentity("user-b");
  assert.equal(events.at(-1).properties.distinct_id, "user-b");
});

test("cross-tab sign-out clears identity and blocks stale mounted-page events", () => {
  const { events, listeners } = browser();
  window.location.pathname = "/dashboard";
  reconcileAnalyticsIdentity("user-a");
  listeners.storage({ key: ANALYTICS_SIGN_OUT });
  posthog.capture("stale-tab-click");
  assert.equal(events.length, 2);
  assert.equal(localStorage.setItem.mock.callCount(), 0);
  window.location.pathname = "/login";
  reconcileAnalyticsIdentity(null);
  assert.ok(events.at(-1).properties.distinct_id.startsWith("anonymous-"));
  resetAnalyticsIdentity();
  assert.equal(localStorage.setItem.mock.calls[0].arguments[0], ANALYTICS_SIGN_OUT);
});

test("server events flush with verified identity and required configuration", async () => {
  configure();
  const requests = [];
  mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, body: JSON.parse(options.headers["Content-Encoding"] === "gzip" ? gunzipSync(options.body).toString() : options.body) });
    return new Response("{}", { status: 200 });
  });
  const client = createPostHogServer();
  assert.equal(client.flushAt, 1);
  assert.equal(client.flushInterval, 0);
  await client.shutdown();
  await captureServerEvent({ userId: "user-a", event: "company_researched", properties: { userId: "wrong", company: "Example" } });
  const event = requests.flatMap((request) => request.body.batch ?? []).find((item) => item.event === "company_researched");
  assert.ok(event);
  assert.equal(event.distinct_id, "user-a");
  assert.equal(event.properties.userId, "user-a");
});

test("server capture failure still shuts down and flush failures do not fail app work", async () => {
  configure();
  mock.method(console, "warn", () => {});
  mock.method(PostHog.prototype, "capture", () => { throw new Error("capture failed"); });
  const shutdown = mock.method(PostHog.prototype, "shutdown", async () => { throw new Error("transport failed"); });
  await assert.doesNotReject(captureServerEvent({ userId: "user-a", event: "company_researched" }));
  assert.equal(shutdown.mock.callCount(), 1);
  assert.equal(shutdown.mock.calls[0].arguments[0], 2000);
});

test("missing configuration leaves server analytics disabled", async () => {
  delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
  assert.equal(createPostHogServer(), null);
  await assert.doesNotReject(captureServerEvent({ userId: "user-a", event: "company_researched" }));
});

test("returning users retain their ID without reset; verified $set passes", () => {
  const { events } = browser("user-a", "user-a");
  reconcileAnalyticsIdentity("user-a", "a@example.test");
  assert.equal(posthog.reset.mock.callCount(), 0);
  assert.deepEqual(events.map((event) => event.event), ["$set", "$pageview"]);
  suspendAnalytics();
  posthog.capture("$set");
  assert.equal(events.length, 2);
  reconcileAnalyticsIdentity("user-a", "a@example.test");
  assert.equal(events.at(-2).event, "$set");
  assert.equal(posthog.reset.mock.callCount(), 0);
});

test("anonymous-to-authenticated transition preserves the anonymous ID for identify", () => {
  const { events } = browser("anonymous-existing", null);
  reconcileAnalyticsIdentity(null);
  reconcileAnalyticsIdentity("user-a");
  assert.equal(posthog.reset.mock.callCount(), 0);
  assert.equal(events.at(-2).event, "$identify");
  assert.equal(events.at(-2).properties.distinct_id, "user-a");
});

test("identity adopted from another tab cannot bypass verified identity", () => {
  const { events, changeIdentity } = browser("user-a", "user-a");
  reconcileAnalyticsIdentity("user-a");
  changeIdentity("user-b");
  posthog.capture("$set");
  posthog.capture("stale-tab-click");
  assert.equal(events.length, 2);
});

test("development defaults to no browser, server, or log analytics; explicit true opts in", async () => {
  configure();
  process.env.NODE_ENV = "development";
  delete process.env.NEXT_PUBLIC_POSTHOG_ENABLE_DEV;
  const init = mock.method(posthog, "init", () => {});
  const reset = mock.method(posthog, "reset", () => {});
  const warn = mock.method(console, "warn", () => {});
  initPostHog();
  reconcileAnalyticsIdentity("user-a");
  resetAnalyticsIdentity();
  assert.equal(init.mock.callCount(), 0);
  assert.equal(reset.mock.callCount(), 0);
  assert.equal(createPostHogServer(), null);
  const logs = await import("../instrumentation.ts?development");
  assert.equal(logs.posthogLogsLoggerProvider, undefined);
  logs.register();
  assert.equal(warn.mock.callCount(), 0);

  process.env.NEXT_PUBLIC_POSTHOG_ENABLE_DEV = "false";
  assert.equal(createPostHogServer(), null);
  process.env.NEXT_PUBLIC_POSTHOG_ENABLE_DEV = "true";
  globalThis.window = { addEventListener() {} };
  initPostHog();
  assert.equal(init.mock.callCount(), 1);
  const client = createPostHogServer();
  assert.ok(client);
  await client.shutdown();
  const enabledLogs = await import("../instrumentation.ts?opt-in");
  assert.ok(enabledLogs.posthogLogsLoggerProvider);
  await enabledLogs.posthogLogsLoggerProvider.shutdown();
});

test("production remains enabled even when the development opt-in is false", async () => {
  configure();
  process.env.NEXT_PUBLIC_POSTHOG_ENABLE_DEV = "false";
  const init = mock.method(posthog, "init", () => {});
  globalThis.window = { addEventListener() {} };
  initPostHog();
  assert.equal(init.mock.callCount(), 1);
  const client = createPostHogServer();
  assert.ok(client);
  await client.shutdown();
  const logs = await import("../instrumentation.ts?production");
  assert.ok(logs.posthogLogsLoggerProvider);
  await logs.posthogLogsLoggerProvider.shutdown();
});

for (const [label, destination] of [
  ["query-only", "/dashboard?tab=activity"],
  ["same-URL", "/dashboard"],
  ["cancelled", "/profile"],
]) {
  test(`${label} navigation does not strand analytics when pathname stays unchanged`, async () => {
    const { events } = browser("user-a", "user-a");
    const instrumentation = await import("../instrumentation-client.ts");
    window.location.pathname = "/dashboard";
    reconcileAnalyticsIdentity("user-a");
    instrumentation.onRouterTransitionStart?.(destination, "push");
    // These navigations need not change usePathname or rerun the identity effect.
    posthog.capture("job_search_started");
    assert.equal(events.at(-1).event, "job_search_started");
    assert.equal(events.at(-1).properties.distinct_id, "user-a");
  });
}

test("pathname navigation blocks destination events until reconciliation, then resumes", async () => {
  const { events } = browser("user-a", "user-a");
  const instrumentation = await import("../instrumentation-client.ts");
  window.location.pathname = "/dashboard";
  reconcileAnalyticsIdentity("user-a");
  instrumentation.onRouterTransitionStart?.("/profile", "push");
  window.location.pathname = "/profile";
  const count = events.length;
  posthog.capture("before-destination-effect");
  assert.equal(events.length, count);
  suspendAnalytics(); // React cleans up the previous effect before setting up the next.
  reconcileAnalyticsIdentity("user-a");
  posthog.capture("profile_completed");
  assert.equal(events.at(-2).event, "$pageview");
  assert.equal(events.at(-1).event, "profile_completed");
  assert.equal(events.at(-1).properties.distinct_id, "user-a");
});

test("installed SDK changes distinct_id before emitting identify and passes authenticated events", () => {
  const { config } = browser("anonymous-existing", null);
  mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  const client = new posthogModule.PostHog();
  client.init("test-project-token", {
    persistence: "memory",
    bootstrap: { distinctID: "anonymous-existing" },
    capture_pageview: false,
    autocapture: false,
    request_batching: false,
    advanced_disable_flags: true,
    disable_external_dependency_loading: true,
    disable_session_recording: true,
  });
  const events = [];
  mock.method(client, "capture", (event, properties) => {
    const result = config.before_send({ event, properties: { ...properties, distinct_id: client.get_distinct_id() } });
    if (result) events.push(result);
    return result;
  });
  // Keep the SDK's real identity mutation and person-property methods; stub only transport.
  mock.method(posthog, "identify", client.identify.bind(client));
  mock.method(posthog, "get_distinct_id", client.get_distinct_id.bind(client));
  mock.method(posthog, "get_property", client.get_property.bind(client));
  mock.method(posthog, "capture", client.capture.bind(client));
  assert.equal(client.get_distinct_id(), "anonymous-existing");
  reconcileAnalyticsIdentity("user-a", "a@example.test");
  assert.equal(client.get_distinct_id(), "user-a");
  posthog.capture("job_search_started");
  assert.deepEqual(events.map((event) => event.event), ["$identify", "$pageview", "job_search_started"]);
  assert.ok(events.every((event) => event.properties.distinct_id === "user-a"));
  assert.equal(events[0].properties.$anon_distinct_id, "anonymous-existing");
  suspendAnalytics();
  window.location.pathname = "/profile";
  reconcileAnalyticsIdentity("user-a", "updated@example.test");
  assert.equal(events.at(-2).event, "$set");
  assert.equal(events.at(-1).event, "$pageview");
});
