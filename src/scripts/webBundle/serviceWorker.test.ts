import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";
import vm from "vm";

type FetchEvent = {
  request: { method: string; url: string; cache: string };
  respondWith: (response: Promise<unknown>) => void;
};

function loadFetchHandler() {
  const listeners = new Map<string, (event: FetchEvent) => void>();
  const source = fs.readFileSync(
    path.resolve("scripts/web-service-worker.js"),
    "utf8",
  );

  vm.runInNewContext(source, {
    self: {
      location: { origin: "https://example.com" },
      addEventListener: (name: string, handler: (event: FetchEvent) => void) =>
        listeners.set(name, handler),
    },
    caches: { match: async () => ({ cached: true }) },
    fetch: async () => ({ ok: true }),
    URL,
    Promise,
  });

  const handler = listeners.get("fetch");
  if (!handler) throw new Error("service worker fetch handler is missing");
  return handler;
}

describe("service worker cache policy", () => {
  it.each([
    ["/app-data.json", "default"],
    ["/assets/index.js", "no-store"],
  ])("lets %s with cache mode %s reach the network", (url, cache) => {
    const handler = loadFetchHandler();
    let intercepted = false;

    handler({
      request: { method: "GET", url: `https://example.com${url}`, cache },
      respondWith: () => {
        intercepted = true;
      },
    });

    expect(intercepted).toBe(false);
  });

  it("still intercepts versioned static assets for offline use", () => {
    const handler = loadFetchHandler();
    let intercepted = false;

    handler({
      request: {
        method: "GET",
        url: "https://example.com/assets/index-abc123.js",
        cache: "default",
      },
      respondWith: () => {
        intercepted = true;
      },
    });

    expect(intercepted).toBe(true);
  });
});
