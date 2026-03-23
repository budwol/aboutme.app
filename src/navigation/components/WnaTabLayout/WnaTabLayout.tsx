import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { useWnaTheme } from "@components/WnaAppContext";
import { navigationLayoutConstants } from "@constants/navigationLayoutConstants";
import { i18nKeys } from "@/i18n/i18nKeys";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { WnaTabScreenConfig } from "@/navigation/config/wnaTabLayoutConfig";

export type WnaTabLayoutProps = {
  screens: WnaTabScreenConfig[];
};

export default function WnaTabLayout({ screens }: WnaTabLayoutProps) {
  const { appColors } = useWnaTheme();
  const { t } = useTranslation(["common"]);
  const iconSize = navigationLayoutConstants.tabBarIconSize;
  const iconSizeFocused = navigationLayoutConstants.tabBarIconSizeFocused;
  const tabBarHeight = navigationLayoutConstants.tabBarHeight;
  const backgroundColor = appColors.isDark
    ? appColors.staticCoolgray8
    : appColors.staticCoolgray1;
  const headerShown = false;

  const getScreenTitle = (screenName: string) => {
    switch (screenName) {
      case "index":
        return t(i18nKeys.screenTitleStartPage);
      case "projects":
      case "projekte":
        return t(i18nKeys.screenTitleProjects);
      case "experience":
      case "taetigkeiten":
        return t(i18nKeys.screenTitleExperience);
      case "contact":
      case "kontakt":
        return t(i18nKeys.screenTitleContact);
      case "menu":
        return t(i18nKeys.screenTitleMenuWithoutDots);
      default:
        return "";
    }
  };

  return (
    <Tabs
      screenOptions={{
        title: "",
        headerTintColor: appColors.staticWhite,
        headerShadowVisible: headerShown,
        tabBarActiveTintColor: appColors.isDark
          ? appColors.accent1
          : appColors.accent5,
        tabBarInactiveTintColor: appColors.isDark
          ? appColors.staticCoolgray5
          : appColors.staticCoolgray6,
        tabBarStyle: {
          backgroundColor: appColors.white,
          elevation: 8,
          borderWidth: 0,
          height: tabBarHeight,
          display: "none",
        },
      }}
    >
      {screens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: getScreenTitle(screen.name),
            headerShown,
            sceneStyle: {
              backgroundColor,
            },
            tabBarLabel: () => null,
            tabBarIcon: ({ focused, color }) => (
              <WnaIcon
                size={focused ? iconSizeFocused : iconSize}
                iconName={screen.icon}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
