import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { I18nextProvider } from "react-i18next";

import WnaApp from "@components/WnaApp";
import { setNavigationBaseUrl } from "@components/navigation/wnaNavigationRouteProvider";
import { i18n } from "@services/i18n/i18n";
import { AppData, loadAppData } from "@/app-data";
import {
  getThemeFromStorageAsync,
  Theme,
} from "@services/wnaAsyncStorageProvider";
import { WnaAppContextProvider } from "@/components/WnaAppContext";

global.__expo_disable_font_preloading__ = true;

function RootLayoutContent() {
  const [appData, setAppData] = useState<AppData | undefined>(undefined);
  const [theme, setTheme] = useState<Theme | "system">("system");

  useEffect(() => {
    async function init() {
      const data = await loadAppData();
      setNavigationBaseUrl(data.siteUrl);
      setAppData(data);

      const theme = (await getThemeFromStorageAsync()) ?? "system";
      setTheme(theme);
    }
    init();
  }, []);

  return !appData ? null : (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <WnaApp appData={appData} theme={theme}>
          <Slot />
        </WnaApp>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <WnaAppContextProvider>
      <RootLayoutContent />
    </WnaAppContextProvider>
  );
}
