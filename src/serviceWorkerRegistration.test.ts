import { afterEach, describe, expect, it, jest } from "@jest/globals";

const originalServiceWorker = Object.getOwnPropertyDescriptor(
  navigator,
  "serviceWorker",
);

function loadRegistration(serviceWorker?: object) {
  jest.resetModules();
  if (serviceWorker) {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: serviceWorker,
    });
  } else {
    Reflect.deleteProperty(navigator, "serviceWorker");
  }

  let onLoad: EventListener | undefined;
  const addEventListener = jest
    .spyOn(window, "addEventListener")
    .mockImplementation((type, listener) => {
      if (type === "load" && typeof listener === "function") {
        onLoad = listener;
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./serviceWorkerRegistration");
  return { addEventListener, onLoad };
}

describe("service worker registration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(globalThis, "__IS_PRODUCTION__", { value: false });
    if (originalServiceWorker) {
      Object.defineProperty(navigator, "serviceWorker", originalServiceWorker);
    } else {
      Reflect.deleteProperty(navigator, "serviceWorker");
    }
  });

  it("does not register when service workers are unavailable", () => {
    const { addEventListener } = loadRegistration();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it("registers the production service worker after load", () => {
    Object.defineProperty(globalThis, "__IS_PRODUCTION__", { value: true });
    const register = jest.fn(async () => ({}));
    const { onLoad } = loadRegistration({ register });

    expect(onLoad).toBeDefined();
    onLoad?.(new Event("load"));
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("unregisters stale service workers in development", async () => {
    const unregister = jest.fn(async () => true);
    const getRegistrations = jest.fn(async () => [{ unregister }]);
    const { onLoad } = loadRegistration({ getRegistrations });

    expect(onLoad).toBeDefined();
    onLoad?.(new Event("load"));
    await Promise.resolve();

    expect(getRegistrations).toHaveBeenCalledTimes(1);
    expect(unregister).toHaveBeenCalledTimes(1);
  });
});
