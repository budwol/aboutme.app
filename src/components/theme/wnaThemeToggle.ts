import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import Colors from "@constants/theme/colors";
import {
  getThemeFromStorageAsync,
  setThemeToStorageAsync,
  Theme,
} from "@/storage/themeStorage";
import { getNextTheme, resolveAppColors } from "@utils/themeColors";
import { BrowserColorScheme } from "@utils/useBrowserColorScheme";
import { showWnaToast } from "@components/feedback/wnaToast";

function getThemeLabel(theme: Theme) {
  switch (theme) {
    case "light":
      return "Light mode";
    case "dark":
      return "Dark mode";
    default:
      return "System mode";
  }
}

export function getThemeIcon(theme: Theme): keyof typeof iconMap {
  switch (theme) {
    case "dark":
      return "moon-waning-crescent";
    case "light":
      return "white-balance-sunny";
    default:
      return "theme-light-dark";
  }
}

type ToggleWnaThemeArgs = {
  colorScheme: BrowserColorScheme;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setAppColors: (colors: Colors) => void;
};

export async function toggleWnaTheme({
  colorScheme,
  theme,
  setTheme,
  setAppColors,
}: ToggleWnaThemeArgs) {
  const currentTheme = (await getThemeFromStorageAsync()) ?? theme;
  const nextTheme = getNextTheme(currentTheme);
  const nextColors = resolveAppColors(nextTheme, colorScheme);

  setAppColors(nextColors);
  setTheme(nextTheme);

  showWnaToast({
    type: "themeChange",
    text1: "Appearance",
    text2: getThemeLabel(nextTheme),
    props: { appColors: nextColors },
  });

  await setThemeToStorageAsync(nextTheme);
}
