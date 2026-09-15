import React, { CSSProperties, useCallback, useMemo } from "react";
import { Linking } from "@utils/webLinking";
import { router, useWnaPathname } from "@/navigation/router/wnaRouter";
import { useTranslation } from "react-i18next";

import WnaDrawerNavigationItem from "@/navigation/components/WnaDrawerNavigationItem";
import {
  useWnaAppData,
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import currentAppVersion from "@utils/currentAppVersion";
import WnaNavigationList, {
  WnaMenuItem,
} from "@/navigation/components/WnaNavigationList";
import { getThemeIcon, toggleWnaTheme } from "@components/theme/wnaThemeToggle";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import {
  getNavigationLang,
  getNavigationPath,
} from "@/navigation/routes/wnaNavigationRoutes";
import {
  appLayoutConstants,
  appSpacingConstants,
} from "@constants/layoutConstants";
import { navigationLayoutConstants } from "@constants/navigationLayoutConstants";
import { getLangCode } from "@/i18n/i18n";
import { i18nKeys } from "@/i18n/i18nKeys";
import { getResumePdfUrl } from "@utils/resumePdfUrl";
import WnaImage from "@components/images/WnaImage";
import { useBrowserColorScheme } from "@utils/useBrowserColorScheme";

const logoSize = navigationLayoutConstants.drawerLogoSize;
const headerHeight = navigationLayoutConstants.drawerHeaderHeight;

export default function WnaDrawerMenu() {
  const { closeDrawer } = useWnaAppLifecycle();
  const { appData } = useWnaAppData();
  const { appStyle, appColors, theme, setTheme, setAppColors } = useWnaTheme();
  const { appLayout } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const pathname = useWnaPathname();
  const navigationRouter = useWnaNavigationTransition(router);
  const colorScheme = useBrowserColorScheme();

  const langCode = getNavigationLang(getLangCode());
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  const rootRoute = getNavigationPath("root", langCode);
  const disclaimerRoute = getNavigationPath("disclaimer", langCode);

  const isStartActive = !lastSegment;
  const drawerBackgroundColor = appColors.isDark
    ? appColors.staticCoolgray8
    : appColors.warmgray1;
  const headerSurfaceColor = appColors.isDark
    ? appColors.accent7
    : appColors.warmgray1;
  const themeLabel = `${t(i18nKeys.settingsTheme)}: ${t(`common:catalogTheme${theme.charAt(0).toUpperCase()}${theme.slice(1)}`)}`;
  const compactButtonHeight = Math.min(
    appLayout.headerButtonHeight ?? appLayoutConstants.headerButtonHeight,
    appLayoutConstants.textInputHeight,
  );

  const items: WnaMenuItem[] = useMemo(
    () => [
      {
        text: t(i18nKeys.screenTitleProfile),
        iconName: "home",
        route: rootRoute,
        type: "nav",
      },
      {
        text: t(i18nKeys.screenTitleExperience),
        iconName: "walk",
        route: getNavigationPath("experience", langCode),
        type: "secondary",
      },
      {
        text: t(i18nKeys.screenTitleContact),
        iconName: "email-outline",
        route: getNavigationPath("contact", langCode),
        type: "secondary",
      },
      {
        text: t(i18nKeys.screenTitleProjects),
        iconName: "rocket-launch-outline",
        route: getNavigationPath("projects", langCode),
        type: "nav",
      },
      {
        text: t(i18nKeys.screenTitleMenuWithoutDots),
        iconName: "dots-horizontal",
        route: getNavigationPath("menu", langCode),
        type: "nav",
      },
    ],
    [langCode, rootRoute, t],
  );

  const handleNavigate = useCallback(
    (targetRoute?: string, isActive?: boolean) => {
      if (!targetRoute || isActive) return;
      navigationRouter.push(targetRoute);
      closeDrawer();
    },
    [closeDrawer, navigationRouter],
  );

  const handleHeaderPress = useCallback(() => {
    if (isStartActive) {
      return;
    }

    handleNavigate(rootRoute, false);
  }, [handleNavigate, isStartActive, rootRoute]);

  const renderItem = useCallback(
    (item: WnaMenuItem) => {
      const routeLast = item.route?.split("/").filter(Boolean).pop();
      const isRootItem = item.route === rootRoute;

      const isActive = isRootItem
        ? isStartActive || routeLast === lastSegment
        : // istanbul ignore next -- every non-root menu item defines a real route today, so routeLast is never undefined; kept as a defensive fallback
          routeLast === undefined
          ? isStartActive
          : routeLast === lastSegment;

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
    [
      appStyle,
      appColors,
      rootRoute,
      lastSegment,
      isStartActive,
      handleNavigate,
    ],
  );

  return React.createElement(
    "div",
    {
      style: {
        ...styles.container,
        backgroundColor: drawerBackgroundColor,
      } as CSSProperties,
    },
    <WnaPressable
      ripple={undefined}
      disableHover
      t={t}
      checkInternetConnection={false}
      style={styles.headerPressable}
      onPress={handleHeaderPress}
    >
      {React.createElement(
        "div",
        {
          style: {
            ...styles.headerContent,
            paddingTop: appLayoutConstants.headerHeightWeb,
          } as CSSProperties,
        },
        React.createElement(
          "div",
          {
            style: {
              ...styles.logoWrapper,
              backgroundColor: headerSurfaceColor,
            } as CSSProperties,
          },
          <WnaImage
            imageUrl="/logo_96.webp"
            appColors={appColors}
            imageTitle={t(i18nKeys.appBrand)}
            style={styles.logo}
          />,
        ),
        React.createElement(
          "div",
          { style: styles.centered },
          React.createElement(
            "span",
            {
              style: {
                ...appStyle.textTitleLarge,
                ...styles.centeredText,
                color: appColors.black,
              } as CSSProperties,
            },
            appData.profile.name,
          ),
          React.createElement(
            "span",
            {
              style: {
                ...appStyle.textSmall,
                ...styles.centeredText,
                opacity: 0.7,
              } as CSSProperties,
            },
            appData.profile.title.toUpperCase(),
          ),
        ),
      )}
    </WnaPressable>,
    React.createElement(
      "div",
      { style: styles.navWrapper },
      <WnaNavigationList
        appStyle={appStyle}
        appLayout={appLayout}
        items={items}
        overridePaddingTop={appSpacingConstants.xs}
        overrideGap={appSpacingConstants.xs}
        style={styles.navList}
        renderItem={renderItem}
      />,
    ),
    React.createElement(
      "div",
      { style: styles.footer },
      <WnaButtonIconText
        appColors={appColors}
        appStyle={appStyle}
        text={t(i18nKeys.actionDownloadResume)}
        iconName={"file-pdf-box"}
        backgroundColor={
          appColors.isDark ? appColors.coolgray2 : appColors.white
        }
        textColor={appColors.black}
        borderWidth={1}
        onPress={() =>
          Linking.openURL(getResumePdfUrl(langCode, appData.profile.name))
        }
        style={{
          ...styles.themeButton,
          height: compactButtonHeight,
          borderRadius:
            appLayout.globalCornerRadius ??
            appLayoutConstants.globalCornerRadius,
        }}
      />,
      <WnaButtonIconText
        appColors={appColors}
        appStyle={appStyle}
        text={themeLabel}
        iconName={getThemeIcon(theme)}
        backgroundColor={
          appColors.isDark ? appColors.coolgray2 : appColors.white
        }
        textColor={appColors.black}
        borderWidth={1}
        onPress={() =>
          void toggleWnaTheme({
            colorScheme,
            theme,
            setTheme,
            setAppColors,
          })
        }
        style={{
          ...styles.themeButton,
          height: compactButtonHeight,
          borderRadius:
            appLayout.globalCornerRadius ??
            appLayoutConstants.globalCornerRadius,
        }}
      />,
      React.createElement(
        "a",
        {
          href: disclaimerRoute,
          onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            navigationRouter.push(disclaimerRoute);
            closeDrawer();
          },
          style: {
            ...appStyle.textNeutralSmall,
            ...styles.footerLink,
          } as CSSProperties,
        },
        `© ${appData.profile.name}`,
      ),
      React.createElement(
        "span",
        {
          style: {
            ...appStyle.textNeutralSmall,
            ...styles.version,
          } as CSSProperties,
        },
        `v ${currentAppVersion()}`,
      ),
    ),
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
  },
  headerPressable: {
    height: headerHeight,
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoWrapper: {
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize / 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  logo: {
    width: logoSize,
    height: logoSize,
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    // Without an explicit width, this column shrinks to its content's
    // natural (unwrapped) size — a long profile title then overflows the
    // drawer's fixed width instead of wrapping onto a second line.
    width: "100%",
    boxSizing: "border-box",
    paddingInline: 24,
  },
  centeredText: {
    textAlign: "center",
  },
  navWrapper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "flex-start",
    marginTop: appSpacingConstants.sm,
  },
  navList: {
    paddingInline: appSpacingConstants.xs,
    paddingBottom: appSpacingConstants.xs,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingInline: 24,
    paddingBottom: 8,
    alignItems: "center",
    gap: 4,
  },
  themeButton: {
    width: "100%",
    marginBottom: 8,
    marginInline: 0,
  },
  footerLink: {
    textDecoration: "underline",
    opacity: 0.9,
  },
  version: {
    opacity: 0.7,
  },
};
