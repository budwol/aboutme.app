import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

import WnaApp from "@components/WnaApp";
import WnaDrawerLayout from "@/navigation/components/WnaDrawerLayout";
import { i18n } from "@/i18n/i18n";
import { AppData, loadAppData } from "@/app-data";
import { getThemeFromStorageAsync, Theme } from "@/storage/themeStorage";
import { WnaAppContextProvider } from "@/state/WnaAppContext";

global.__expo_disable_font_preloading__ = true;

function WnaRootLayoutContent() {
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
        <WnaDrawerLayout />
      </WnaApp>
    </I18nextProvider>
  );
}

export default function WnaRootLayout() {
  return (
    <WnaAppContextProvider>
      <WnaRootLayoutContent />
    </WnaAppContextProvider>
  );
}
