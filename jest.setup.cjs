process.env.EXPO_PUBLIC_SITE_URL =
  process.env.EXPO_PUBLIC_SITE_URL || "https://portfolio.example.com";

global.IS_REACT_ACT_ENVIRONMENT = true;

global.__APP_VERSION__ = require("./package.json").version;

// jsdom doesn't implement fetch. Tests always mock it themselves
// (jest.spyOn(global, "fetch")), so a stub that's merely callable is
// enough here — no real network stack needed.
global.fetch = () =>
  Promise.reject(new Error("fetch is not implemented in tests; mock it"));

// jsdom schedules a process.nextTick callback per test file to fire its
// window's "load" event. That callback can still be pending when Jest
// tears the environment down for a fast-finishing file, and only fires
// once Node gets back around to it during a *later* file — by then the
// window is gone, so jsdom's own internal event-dispatch machinery
// (whatever shape that takes: a missing addEventListener, a stale event
// target, etc.) throws. This is jsdom-internal bookkeeping unrelated to
// any test outcome (jsdom/jsdom#2555-style teardown timing), so it's
// swallowed here rather than crashing the whole worker process. It's
// identified structurally, not by message text: a real test failure's
// stack always leads back through the test file/react-test-renderer,
// while this fires as a bare process.nextTick callback originating
// directly in jsdom's own Window.js.
process.on("uncaughtException", (error) => {
  const stack = typeof error?.stack === "string" ? error.stack : "";
  const isDanglingJsdomTeardownCallback =
    stack.includes("jsdom/lib/jsdom/browser/Window.js") &&
    stack.includes("processTicksAndRejections");

  if (!isDanglingJsdomTeardownCallback) {
    throw error;
  }
});
