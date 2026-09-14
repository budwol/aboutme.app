import { useWnaAppLifecycle, useWnaTheme } from "@/state/WnaAppContext";
import WnaSurfaceCard from "@components/cards/WnaSurfaceCard";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import WnaNavigationItem from "@/navigation/components/WnaNavigationItem";
import { getThemeIcon, toggleWnaTheme } from "@components/theme/wnaThemeToggle";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import {
  getDrawerNavigationPath,
  getNavigationLang,
} from "@/navigation/routes/wnaNavigationRoutes";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import { getLangCode } from "@/i18n/i18n";
import { i18nKeys } from "@/i18n/i18nKeys";
import { useRouter } from "expo-router";
import React, { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

export default function WnaMenuRoute(): ReactNode {
  const { isAppInitialized } = useWnaAppLifecycle();
  const { appColors, appStyle, theme, setTheme, setAppColors } = useWnaTheme();
  const router = useRouter();
  const navigationRouter = useWnaNavigationTransition(router);
  const { t } = useTranslation(["common"]);
  const lang = getNavigationLang(getLangCode());
  const colorScheme = useColorScheme();
  const styleSectionHeadline: CSSProperties = {
    ...(appStyle.textNeutralMedium as CSSProperties),
    textTransform: "uppercase",
    color: appColors.coolgray5,
  };

  if (!isAppInitialized) return null;

  return (
    <WnaScrollViewScreen
      isRootPage
      headerTitle={t(i18nKeys.screenTitleMenuWithoutDots)}
      titleHref="/"
      showContactFooter={false}
      showAppStoreButtons={false}
      headerButton0={
        <WnaHeaderRouteButton
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route={"home"}
          t={t}
        />
      }
      headerButton1={
        <WnaMenuToggleButton appStyle={appStyle} appColors={appColors} t={t} />
      }
    >
      <WnaSurfaceCard appColors={appColors}>
        {React.createElement(
          "span",
          { style: styleSectionHeadline },
          t(i18nKeys.settingsTheme),
        )}
        <WnaSeparatorHorizontal space={4} transparent={true} />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={`${t(i18nKeys.settingsTheme)}: ${t(`common:catalogTheme${theme.charAt(0).toUpperCase()}${theme.slice(1)}`)}`}
          iconName={getThemeIcon(theme)}
          iconRightName={null}
          type={"standalone"}
          onPress={() =>
            void toggleWnaTheme({
              colorScheme,
              theme,
              setTheme,
              setAppColors,
            })
          }
          t={t}
        />
      </WnaSurfaceCard>
      <WnaSeparatorHorizontal space={12} transparent={true} />
      <WnaSurfaceCard appColors={appColors}>
        {React.createElement(
          "span",
          { style: styleSectionHeadline },
          t(i18nKeys.wordLegal),
        )}
        <WnaSeparatorHorizontal space={4} transparent={true} />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t(i18nKeys.screenTitleDisclaimer)}
          iconName={"scale-balance"}
          type={"first"}
          onPress={() =>
            navigationRouter.navigate(
              getDrawerNavigationPath("disclaimer", lang),
            )
          }
          t={t}
        />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t("common:screenTitlePrivacy")}
          iconName={"shield-account"}
          type={"middle"}
          onPress={() =>
            navigationRouter.navigate(getDrawerNavigationPath("privacy", lang))
          }
          t={t}
        />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t(i18nKeys.screenTitleTerms)}
          iconName={"file-sign"}
          type={"middle"}
          onPress={() =>
            navigationRouter.navigate(getDrawerNavigationPath("terms", lang))
          }
          t={t}
        />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t(i18nKeys.screenTitleLicenses)}
          iconName={"certificate-outline"}
          type={"last"}
          onPress={() =>
            navigationRouter.navigate(getDrawerNavigationPath("licenses", lang))
          }
          t={t}
        />
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
