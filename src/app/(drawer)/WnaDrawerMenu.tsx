import { useCallback, useEffect, useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { Href, router, useNavigation, useSegments } from "expo-router";
import { useTranslation } from "react-i18next";

import WnaDrawerNavigationItem from "@/components/navigation/WnaDrawerNavigationItem";
import { useWnaLayout, useWnaTheme } from "@components/WnaAppContext";
import WnaPressable from "@components/buttons/WnaPressable";
import currentAppVersion from "@components/currentAppVersion";
import WnaNavigationList, {
  WnaMenuItem,
} from "@components/navigation/WnaNavigationList";
import { getDrawerNavigationPath } from "@components/navigation/wnaNavigationRouteProvider";
import { appLayoutConstants } from "@constants/layoutConstants";
import { getLangCode } from "@services/i18n/i18n";
import { i18nKeys } from "@services/i18n/i18nKeys";
import WnaImage from "@components/images/WnaImage";
import { getNavigationLang } from "@components/navigation/wnaNavigationRoutes";

const LOGO_SIZE = 64;
const HEADER_HEIGHT = 212;

export default function WnaDrawerMenu() {
  const status = useDrawerStatus();
  const navigation = useNavigation();
  const { appStyle, appColors } = useWnaTheme();
  const { appLayout } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const segments = useSegments();

  const langCode = getNavigationLang(getLangCode());
  const lastSegment = segments.at(-1);

  const baseRoute = getDrawerNavigationPath("root", langCode);

  const isStartActive =
    !lastSegment || ["(tabs)", "(tabs-de)", "(tabs-en)"].includes(lastSegment);

  const items: WnaMenuItem[] = useMemo(
    () => [
      {
        text: t(i18nKeys.screenTitleStartPage),
        iconName: "home",
        route: getDrawerNavigationPath("root", langCode),
        type: "nav",
      },
      {
        text: t(i18nKeys.screenTitleExperience),
        iconName: "walk",
        route: getDrawerNavigationPath("experience", langCode),
        type: "secondary",
      },
      {
        text: t(i18nKeys.screenTitleContact),
        iconName: "email-outline",
        route: getDrawerNavigationPath("contact", langCode),
        type: "secondary",
      },
      {
        text: t(i18nKeys.screenTitleProjects),
        iconName: "rocket-launch-outline",
        route: getDrawerNavigationPath("projects", langCode),
        type: "nav",
      },
      {
        text: t(i18nKeys.screenTitleMenuWithoutDots),
        iconName: "dots-horizontal",
        route: getDrawerNavigationPath("menu", langCode),
        type: "nav",
      },
    ],
    [langCode, t],
  );

  useEffect(() => {
    if (status === "open") {
      navigation.setOptions({ animationEnabled: false });
    }
  }, [status, navigation]);

  const handleNavigate = useCallback((route?: string, isActive?: boolean) => {
    if (!route || isActive) return;
    router.push(route as Href);
  }, []);

  const renderItem = useCallback(
    (item: WnaMenuItem) => {
      const routeLast = item.route?.split("/").filter(Boolean).pop();

      const isActive =
        routeLast === undefined ? isStartActive : routeLast === lastSegment;

      return (
        <WnaDrawerNavigationItem
          key={item.route}
          iconName={item.iconName!}
          appStyle={appStyle}
          appColors={appColors}
          text={item.text}
          isSecondary={item.type === "secondary"}
          isActive={isActive}
          onPress={() => handleNavigate(item.route, isActive)}
        />
      );
    },
    [appStyle, appColors, lastSegment, isStartActive, handleNavigate],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: appColors.isDark
            ? appColors.staticCoolgray8
            : appColors.warmgray1,
        },
      ]}
    >
      {/* HEADER */}
      <WnaPressable
        ripple={undefined}
        disableHover
        t={t}
        checkInternetConnection={false}
        style={styles.headerPressable}
        onPress={() => router.push(baseRoute)}
      >
        <View
          style={[
            styles.headerContent,
            { paddingTop: appLayoutConstants.headerHeightWeb },
          ]}
        >
          <View
            style={[
              styles.logoWrapper,
              {
                backgroundColor: appColors.isDark
                  ? appColors.accent7
                  : appColors.warmgray1,
              },
            ]}
          >
            <WnaImage
              imageUrl="/logo_96.webp"
              appColors={appColors}
              imageTitle="logo"
              style={styles.logo}
            />
          </View>

          <View style={styles.centered}>
            <Text style={[appStyle.textTitleLarge, { color: appColors.black }]}>
              {t(i18nKeys.appBrand)}
            </Text>
            <Text style={[appStyle.textSmall, { opacity: 0.7 }]}>
              SOFTWARE ENGINEER
            </Text>
          </View>
        </View>
      </WnaPressable>

      {/* NAVIGATION */}
      <View style={styles.navWrapper}>
        <WnaNavigationList
          appStyle={appStyle}
          appLayout={appLayout}
          items={items}
          overWritePaddingTop={1}
          overWriteGap={1}
          style={styles.navList}
          renderItem={renderItem}
        />
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text
          onPress={() =>
            router.push(getDrawerNavigationPath("disclaimer", langCode))
          }
          accessibilityRole="link"
          style={[appStyle.textNeutralSmall, styles.footerLink]}
        >
          © {t(i18nKeys.appBrand)}
        </Text>

        <Text style={[appStyle.textNeutralSmall, styles.version]}>
          v {currentAppVersion()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPressable: {
    height: HEADER_HEIGHT,
  },
  headerContent: {
    alignItems: "center",
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  centered: {
    alignItems: "center",
  },
  navWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  navList: {
    padding: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: "center",
    gap: 4,
  },
  footerLink: {
    textDecorationLine: "underline",
    opacity: 0.9,
  },
  version: {
    opacity: 0.7,
  },
});
