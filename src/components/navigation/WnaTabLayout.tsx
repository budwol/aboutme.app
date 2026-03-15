import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { useWnaTheme } from "@components/WnaAppContext";
import { WnaHapticTab } from "@components/tabbar/WnaHapticTab";
import TabBarBackground from "@components/tabbar/WnaTabBarBackground";
import { Tabs } from "expo-router";
import { WnaTabScreenConfig } from "./wnaTabLayoutConfig";

export type WnaTabLayoutProps = {
  screens: WnaTabScreenConfig[];
};

export default function WnaTabLayout({ screens }: WnaTabLayoutProps) {
  const { appColors } = useWnaTheme();
  const iconSize = 20;
  const iconSizeFocused = 22;
  const tabBarHeight = 40;
  const backgroundColor = appColors.isDark
    ? appColors.staticCoolgray8
    : appColors.staticCoolgray1;
  const headerShown = false;

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
        tabBarButton: WnaHapticTab,
        tabBarBackground: TabBarBackground,
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
