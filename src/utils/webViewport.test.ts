import { describe, expect, it } from "@jest/globals";
import { getWebViewportDimensions } from "@utils/webViewport";

describe("getWebViewportDimensions", () => {
  it("reads browser viewport and screen dimensions", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 720,
    });
    Object.defineProperty(window, "screen", {
      configurable: true,
      value: { width: 1920, height: 1080 },
    });

    expect(getWebViewportDimensions()).toEqual({
      screenWidth: 1920,
      screenHeight: 1080,
      windowWidth: 1280,
      windowHeight: 720,
      isLandscape: true,
    });
  });

  it("falls back to the viewport when screen dimensions are unavailable", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, "screen", {
      configurable: true,
      value: { width: 0, height: 0 },
    });

    expect(getWebViewportDimensions()).toEqual({
      screenWidth: 390,
      screenHeight: 844,
      windowWidth: 390,
      windowHeight: 844,
      isLandscape: false,
    });
  });

  it("returns neutral dimensions during server rendering", () => {
    const originalWindow = global.window;
    // @ts-expect-error testing the SSR environment
    delete global.window;

    expect(getWebViewportDimensions()).toEqual({
      screenWidth: 0,
      screenHeight: 0,
      windowWidth: 0,
      windowHeight: 0,
      isLandscape: false,
    });

    Object.defineProperty(global, "window", {
      configurable: true,
      value: originalWindow,
    });
  });
});
