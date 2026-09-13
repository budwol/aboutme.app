import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  getThemeFromStorageAsync,
  setThemeToStorageAsync,
} from "@/storage/themeStorage";
import Logger from "wna-logger";

jest.mock("wna-logger", () => ({
  error: jest.fn(),
}));

const storage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
const originalStorage = globalThis.localStorage;

describe("themeStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalStorage,
    });
  });

  it("stores the selected theme", async () => {
    await setThemeToStorageAsync("dark");

    expect(storage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("logs storage write errors", async () => {
    (
      storage.setItem as jest.MockedFunction<typeof storage.setItem>
    ).mockImplementationOnce(() => {
      throw new Error("nope");
    });

    await setThemeToStorageAsync("light");

    expect(Logger.error).toHaveBeenCalledWith(
      "setThemeToStorageAsync",
      expect.any(Error),
    );
  });

  it("returns the stored theme or system fallback", async () => {
    (
      storage.getItem as jest.MockedFunction<typeof storage.getItem>
    ).mockReturnValueOnce("dark");
    (
      storage.getItem as jest.MockedFunction<typeof storage.getItem>
    ).mockReturnValueOnce(null);

    await expect(getThemeFromStorageAsync()).resolves.toBe("dark");
    await expect(getThemeFromStorageAsync()).resolves.toBe("system");
  });

  it("logs storage read errors", async () => {
    (
      storage.getItem as jest.MockedFunction<typeof storage.getItem>
    ).mockImplementationOnce(() => {
      throw new Error("nope");
    });

    await expect(getThemeFromStorageAsync()).resolves.toBeUndefined();
    expect(Logger.error).toHaveBeenCalledWith(
      "getThemeFromStorageAsync",
      expect.any(Error),
    );
  });

  it("falls back safely when local storage is unavailable", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: undefined,
    });

    await expect(getThemeFromStorageAsync()).resolves.toBe("system");
    await expect(setThemeToStorageAsync("dark")).resolves.toBeUndefined();
    expect(Logger.error).not.toHaveBeenCalled();
  });
});
