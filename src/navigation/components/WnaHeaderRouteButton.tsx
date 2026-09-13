import WnaButtonHeader from "@components/buttons/WnaButtonHeader";
import { getNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import { i18nKeys } from "@/i18n/i18nKeys";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import { Router } from "expo-router";
import { TFunction } from "i18next";
import React, { CSSProperties, memo } from "react";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";

export type WnaHeaderRouteButtonProps = {
  appColors: Colors;
  appStyle: AppStyle;
  t: TFunction<string[], undefined>;
  router: Router;
  route: "home" | "projects" | "experience";
};

function getHeaderButtonConfig(
  routeKey: WnaHeaderRouteButtonProps["route"],
  t: TFunction<string[], undefined>,
) {
  switch (routeKey) {
    case "projects":
      return {
        title: t(i18nKeys.screenTitleProjects),
        icon: "rocket-launch-outline" as keyof typeof iconMap,
        route: getNavigationPath("projects"),
      };
    case "experience":
      return {
        title: t(i18nKeys.screenTitleExperience),
        icon: "walk" as keyof typeof iconMap,
        route: getNavigationPath("experience"),
      };
    default:
      return {
        title: t(i18nKeys.screenTitleStartPage),
        icon: "home" as keyof typeof iconMap,
        route: getNavigationPath("root"),
      };
  }
}

function WnaHeaderRouteButton({
  appColors,
  appStyle,
  t,
  router,
  route,
}: WnaHeaderRouteButtonProps) {
  const config = getHeaderButtonConfig(route, t);
  const navigationRouter = useWnaNavigationTransition(router);

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      } as CSSProperties,
    },
    <WnaButtonHeader
      appStyle={appStyle}
      appColors={appColors}
      text={config.title}
      iconName={config.icon}
      onPress={() => navigationRouter.push(config.route)}
      t={t}
      checkInternetConnection={false}
    />,
  );
}

export default memo(WnaHeaderRouteButton);
