import Logger from "wna-logger";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark" | "system";
const themeKey = "theme";

export async function setThemeToStorageAsync(value: Theme) {
  try {
    await AsyncStorage.setItem(themeKey, value);
  } catch (e) {
    Logger.error(setThemeToStorageAsync.name, e);
  }
}

export async function getThemeFromStorageAsync() {
  try {
    const value = await AsyncStorage.getItem(themeKey);
    return value !== null ? (value as Theme) : "system";
  } catch (e) {
    Logger.error(getThemeFromStorageAsync.name, e);
  }
}
