import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getThemeFromStorageAsync,
  setThemeToStorageAsync,
} from "@/storage/themeStorage";
import Logger from "wna-logger";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("wna-logger", () => ({
  error: jest.fn(),
}));

describe("themeStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores the selected theme", async () => {
    await setThemeToStorageAsync("dark");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("logs storage write errors", async () => {
    (
      AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>
    ).mockRejectedValueOnce(new Error("nope"));

    await setThemeToStorageAsync("light");

    expect(Logger.error).toHaveBeenCalledWith(
      "setThemeToStorageAsync",
      expect.any(Error),
    );
  });

  it("returns the stored theme or system fallback", async () => {
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockResolvedValueOnce("dark");
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockResolvedValueOnce(null);

    await expect(getThemeFromStorageAsync()).resolves.toBe("dark");
    await expect(getThemeFromStorageAsync()).resolves.toBe("system");
  });

  it("logs storage read errors", async () => {
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockRejectedValueOnce(new Error("nope"));

    await expect(getThemeFromStorageAsync()).resolves.toBeUndefined();
    expect(Logger.error).toHaveBeenCalledWith(
      "getThemeFromStorageAsync",
      expect.any(Error),
    );
  });
});
