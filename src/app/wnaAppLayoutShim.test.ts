/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it } from "@jest/globals";

describe("app/_layout", () => {
  it("re-exports WnaRootLayout as the default", () => {
    const layoutModule = require("./_layout");
    const rootLayoutModule = require("@components/WnaRootLayout");

    expect(layoutModule.default).toBe(rootLayoutModule.default);
  });

  it("re-exports WnaApp's ErrorBoundary", () => {
    const layoutModule = require("./_layout");
    const wnaAppModule = require("@components/WnaApp");

    expect(layoutModule.ErrorBoundary).toBe(wnaAppModule.ErrorBoundary);
  });
});
