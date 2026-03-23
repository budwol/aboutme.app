import Colors from "@constants/theme/colors";
import { themePalettes } from "@constants/themePalettes";
import { Theme } from "@/storage/themeStorage";
import { ColorSchemeName } from "react-native";

export function resolveAppColors(
  theme: Theme,
  systemColorScheme: ColorSchemeName,
): Colors {
  if (theme === "light") {
    return themePalettes.light;
  }

  if (theme === "dark") {
    return themePalettes.dark;
  }

  return themePalettes[systemColorScheme === "dark" ? "dark" : "light"];
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
