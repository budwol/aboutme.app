/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it } from "@jest/globals";

// Each of these files exists purely so expo-router's static exporter
// pre-renders a real HTML file per URL (matching today's per-route export
// shape, so switching to our own client router doesn't also silently
// change the static-export/deployment model) — every one just re-exports
// the same WnaRoutes component, which does the actual matching itself
// from window.location.pathname at runtime.
const stubModulePaths = [
  "./index",
  "./menu/index",
  "./menu/impressum",
  "./menu/disclaimer",
  "./menu/datenschutz",
  "./menu/privacy",
  "./menu/nutzungsbedingungen",
  "./menu/terms-of-use",
  "./menu/lizenzen",
  "./menu/third-party-licenses",
  "./projekte/index",
  "./projects/index",
  "./taetigkeiten/index",
  "./experience/index",
  "./kontakt/index",
  "./contact/index",
  "./projekte/[slug]",
  "./projects/[slug]",
  "./+not-found",
];

describe("app route stubs", () => {
  it.each(stubModulePaths)(
    "%s re-exports WnaRoutes as the default",
    (modulePath) => {
      const stubModule = require(modulePath);
      const wnaRoutesModule = require("@/navigation/router/WnaRoutes");

      expect(stubModule.default).toBe(wnaRoutesModule.default);
    },
  );
});
