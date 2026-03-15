import Colors from "@constants/theme/colors";
import { CurrentColors } from "@constants/currentColors";
import { Theme } from "@services/wnaAsyncStorageProvider";
import { ColorSchemeName } from "react-native";

export function resolveAppColors(
  theme: Theme,
  systemColorScheme: ColorSchemeName,
): Colors {
  if (theme === "light") {
    return CurrentColors.light;
  }

  if (theme === "dark") {
    return CurrentColors.dark;
  }

  return CurrentColors[systemColorScheme === "dark" ? "dark" : "light"];
}

export function getNextTheme(currentTheme: Theme): Theme {
  switch (currentTheme) {
    case "light":
      return "dark";
    case "dark":
      return "system";
    default:
      return "light";
  }
}
