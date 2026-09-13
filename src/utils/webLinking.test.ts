import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { Linking } from "@utils/webLinking";

describe("web linking adapter", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  it.each(["https://example.com", "mailto:hello@example.com", "tel:+4912345"])(
    "accepts %s",
    async (url) => {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: { location: { href: "https://app.example.com/" } },
      });

      await expect(Linking.canOpenURL(url)).resolves.toBe(true);
    },
  );

  it("rejects unsupported and malformed URLs", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { href: "https://app.example.com/" } },
    });

    await expect(Linking.canOpenURL("javascript:alert(1)")).resolves.toBe(
      false,
    );
    await expect(Linking.canOpenURL("not a url")).resolves.toBe(false);
  });

  it("rejects URLs that the browser URL parser cannot parse", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { href: "https://app.example.com/" } },
    });

    await expect(Linking.canOpenURL("https://[")).resolves.toBe(false);
  });

  it("opens web URLs in a new tab with safe window features", async () => {
    const open = jest.fn(() => ({}));
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: { href: "https://app.example.com/" },
        open,
      },
    });

    await Linking.openURL("https://example.com");

    expect(open).toHaveBeenCalledWith(
      "https://example.com/",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("uses browser navigation for mail and telephone URLs", async () => {
    const open = jest.fn();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { href: "https://app.example.com/" }, open },
    });

    await Linking.openURL("mailto:hello@example.com");
    await Linking.openURL("tel:+4912345");

    expect(open).toHaveBeenNthCalledWith(
      1,
      "mailto:hello@example.com",
      "_self",
    );
    expect(open).toHaveBeenNthCalledWith(2, "tel:+4912345", "_self");
  });

  it("does not navigate the active tab when a new tab is blocked", async () => {
    const assign = jest.fn();
    const open = jest.fn(() => null);
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: { href: "https://app.example.com/", assign },
        open,
      },
    });

    await Linking.openURL("https://example.com");

    expect(open).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();
  });

  it("throws before opening unsupported URLs", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { href: "https://app.example.com/" } },
    });

    await expect(Linking.openURL("javascript:alert(1)")).rejects.toThrow(
      "Unsupported URL",
    );
  });

  it("does nothing when opened outside a browser", async () => {
    await expect(
      Linking.openURL("https://example.com"),
    ).resolves.toBeUndefined();
  });
});
