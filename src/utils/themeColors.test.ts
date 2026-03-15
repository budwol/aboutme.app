import { describe, expect, it } from "@jest/globals";
import { getNextTheme, resolveAppColors } from "@utils/themeColors";

describe("themeColors", () => {
  it("resolves explicit light and dark themes", () => {
    expect(resolveAppColors("light", "dark").isDark).toBe(false);
    expect(resolveAppColors("dark", "light").isDark).toBe(true);
  });

  it("uses the system theme when set to system", () => {
    expect(resolveAppColors("system", "dark").isDark).toBe(true);
    expect(resolveAppColors("system", "light").isDark).toBe(false);
    expect(resolveAppColors("system", null).isDark).toBe(false);
  });

  it("cycles themes in the expected order", () => {
    expect(getNextTheme("system")).toBe("light");
    expect(getNextTheme("light")).toBe("dark");
    expect(getNextTheme("dark")).toBe("system");
  });
});
