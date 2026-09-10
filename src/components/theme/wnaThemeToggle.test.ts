import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { getThemeIcon, toggleWnaTheme } from "@components/theme/wnaThemeToggle";
import {
  getThemeFromStorageAsync,
  setThemeToStorageAsync,
} from "@/storage/themeStorage";

jest.mock("@/storage/themeStorage", () => ({
  getThemeFromStorageAsync: jest.fn(),
  setThemeToStorageAsync: jest.fn(),
}));

jest.mock("@components/feedback/wnaToast");

const mockShowWnaToast = (
  jest.requireMock("@components/feedback/wnaToast") as {
    showWnaToast: jest.Mock;
  }
).showWnaToast;

describe("wnaThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns localized theme icons", () => {
    expect(getThemeIcon("light")).toBe("white-balance-sunny");
    expect(getThemeIcon("dark")).toBe("moon-waning-crescent");
    expect(getThemeIcon("system")).toBe("theme-light-dark");
  });

  it("toggles from stored theme and persists the next theme", async () => {
    const setTheme = jest.fn();
    const setAppColors = jest.fn();
    (
      getThemeFromStorageAsync as jest.MockedFunction<
        typeof getThemeFromStorageAsync
      >
    ).mockResolvedValueOnce("light");

    await toggleWnaTheme({
      colorScheme: "dark",
      theme: "system",
      setTheme,
      setAppColors,
    });

    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(setAppColors).toHaveBeenCalledWith(
      expect.objectContaining({ isDark: true }),
    );
    expect(mockShowWnaToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "themeChange",
        text1: "Appearance",
        text2: "Dark mode",
      }),
    );
    expect(setThemeToStorageAsync).toHaveBeenCalledWith("dark");
  });

  it("falls back to the current theme when storage is empty", async () => {
    const setTheme = jest.fn();
    const setAppColors = jest.fn();
    (
      getThemeFromStorageAsync as jest.MockedFunction<
        typeof getThemeFromStorageAsync
      >
    ).mockResolvedValueOnce(undefined);

    await toggleWnaTheme({
      colorScheme: "light",
      theme: "dark",
      setTheme,
      setAppColors,
    });

    expect(setTheme).toHaveBeenCalledWith("system");
    expect(mockShowWnaToast).toHaveBeenCalledWith(
      expect.objectContaining({ text2: "System mode" }),
    );
  });
});
