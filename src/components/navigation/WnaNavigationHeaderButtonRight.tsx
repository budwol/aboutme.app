import WnaButtonHeader from "@components/buttons/WnaButtonHeader";
import { getNavigationPath } from "@components/navigation/wnaNavigationRouteProvider";
import { useWnaNavigationTransition } from "@components/navigation/useWnaNavigationTransition";
import { i18nKeys } from "@services/i18n/i18nKeys";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";
import { Router } from "expo-router";
import { TFunction } from "i18next";
import { memo } from "react";
import { View } from "react-native";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";

export type WnaNavigationHeaderButtonRightProps = {
  appColors: Colors;
  appStyle: AppStyle;
  t: TFunction<string[], undefined>;
  router: Router;
  route: "home" | "projects" | "experience";
};

function getHeaderButtonConfig(
  routeKey: WnaNavigationHeaderButtonRightProps["route"],
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

function WnaNavigationHeaderButtonRight({
  appColors,
  appStyle,
  t,
  router,
  route,
}: WnaNavigationHeaderButtonRightProps) {
  const config = getHeaderButtonConfig(route, t);
  const navigationRouter = useWnaNavigationTransition(router);

  return (
    <View style={{ alignItems: "center" }}>
      <WnaButtonHeader
        appStyle={appStyle}
        appColors={appColors}
        text={config.title}
        iconName={config.icon}
        onPress={() => navigationRouter.push(config.route)}
        t={t}
        checkInternetConnection={false}
      />
    </View>
  );
}

export default memo(WnaNavigationHeaderButtonRight);
