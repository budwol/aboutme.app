import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { I18nextProvider } from "react-i18next";

import WnaApp from "@components/WnaApp";
import { i18n } from "@/i18n/i18n";
import { AppData, loadAppData } from "@/app-data";
import { getThemeFromStorageAsync, Theme } from "@/storage/themeStorage";
import { WnaAppContextProvider } from "@/state/WnaAppContext";

// re-exported so expo-router picks it up as this layout's crash fallback UI
export { ErrorBoundary } from "@components/WnaApp";

global.__expo_disable_font_preloading__ = true;

function RootLayoutContent() {
  const [appData, setAppData] = useState<AppData | undefined>(undefined);
  const [theme, setTheme] = useState<Theme | "system">("system");

  useEffect(() => {
    async function init() {
      const data = await loadAppData();
      setAppData(data);

      const theme = (await getThemeFromStorageAsync()) ?? "system";
      setTheme(theme);
    }
    init();
  }, []);

  return !appData ? null : (
    <I18nextProvider i18n={i18n}>
      <WnaApp appData={appData} theme={theme}>
        <Slot />
      </WnaApp>
    </I18nextProvider>
  );
}

export default function RootLayout() {
  return (
    <WnaAppContextProvider>
      <RootLayoutContent />
    </WnaAppContextProvider>
  );
}
