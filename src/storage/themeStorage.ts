import Logger from "wna-logger";

export type Theme = "light" | "dark" | "system";
const themeKey = "theme";

function getWebStorage(): Storage | undefined {
  return typeof localStorage === "undefined" ? undefined : localStorage;
}

export async function setThemeToStorageAsync(value: Theme) {
  try {
    getWebStorage()?.setItem(themeKey, value);
  } catch (e) {
    Logger.error(setThemeToStorageAsync.name, e);
  }
}

export async function getThemeFromStorageAsync() {
  try {
    const value = getWebStorage()?.getItem(themeKey) ?? null;
    return value !== null ? (value as Theme) : "system";
  } catch (e) {
    Logger.error(getThemeFromStorageAsync.name, e);
    return undefined;
  }
}
