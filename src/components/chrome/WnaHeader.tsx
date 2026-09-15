import { createShadowStyle } from "@components/effects/wnaShadowStyle";
import { getNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import { useWnaLayout, useWnaTheme } from "@/state/WnaAppContext";
import { getThemeIcon, toggleWnaTheme } from "@components/theme/wnaThemeToggle";
import { router, WnaHref } from "@/navigation/router/wnaRouter";
import React, { CSSProperties, FC, memo, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useBrowserColorScheme } from "@utils/useBrowserColorScheme";
import WnaButtonHeader from "@components/buttons/WnaButtonHeader";
import { WnaBlurView } from "@components/effects/WnaBlurView";
import WnaMultilineHeader from "@components/chrome/WnaMultilineHeader";
import { i18nKeys } from "@/i18n/i18nKeys";

export type WnaHeaderProps = {
  headerTitle?: string;
  icon?: string;
  isRootPage?: boolean;
  isBusy?: boolean;
  askBeforeBack?: boolean;
  backHref?: WnaHref;
  titleHref?: WnaHref;
  preventBack?: boolean;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  scrollY?: number;
  showShadow?: boolean;
  onTitlePress?: () => void;
};

export const WnaHeader: FC<WnaHeaderProps> = memo(
  ({
    headerTitle,
    isRootPage = false,
    isBusy = false,
    backHref,
    titleHref,
    headerButton0,
    headerButton1,
    headerButton2,
    scrollY,
    showShadow,
    onTitlePress,
  }) => {
    const navigationRouter = useWnaNavigationTransition(router);
    const { appColors, appStyle, setAppColors, theme, setTheme } =
      useWnaTheme();
    const { appLayout, isLandscape } = useWnaLayout();
    const colorScheme = useBrowserColorScheme();
    const { t } = useTranslation(["common"]);

    const themeIcon = getThemeIcon(theme);
    const canUseBrowserBack =
      typeof window !== "undefined" && window.history.length > 1;

    const scrollValue = scrollY ?? 0;
    const baseOpacity = Math.min(0.4, Math.max(0, scrollValue / 1000));
    const shadowStrength =
      showShadow === true
        ? 1
        : showShadow === false
          ? 0
          : baseOpacity >= 0.4
            ? 1
            : baseOpacity;
    const headerShadowStyle = createShadowStyle(shadowStrength);

    const calculatedBlur = Math.min(1, Math.max(0, baseOpacity * 2.4));
    const blurOpacity =
      showShadow === true && calculatedBlur < 0.2 ? 0.2 : calculatedBlur;
    const blurContainerStyle = {
      opacity: blurOpacity,
    };

    const blurOverlayStyle = {
      opacity: baseOpacity,
    };

    const handleBack = useCallback(() => {
      if (isBusy) return;

      if (backHref) {
        navigationRouter.replace(backHref);
        return;
      }

      if (canUseBrowserBack) {
        navigationRouter.runNavigationTransition(() => {
          window.history.back();
        });
        return;
      }

      if (router.canGoBack()) {
        navigationRouter.back();
      } else {
        navigationRouter.navigate(getNavigationPath("root"));
      }
    }, [backHref, canUseBrowserBack, isBusy, navigationRouter]);

    const handleTitlePress = useCallback(() => {
      if (isBusy) return;

      if (onTitlePress) {
        onTitlePress();
        return;
      }

      if (titleHref) {
        navigationRouter.replace(titleHref);
        return;
      }

      handleBack();
    }, [handleBack, isBusy, navigationRouter, onTitlePress, titleHref]);

    const backButtonVisible =
      !isRootPage &&
      (Boolean(backHref) || canUseBrowserBack || router.canGoBack());

    const headerStyle: CSSProperties = {
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: appLayout.headerHeight,
      justifyContent: isLandscape ? "center" : "flex-end",
    };

    const headerContentStyle: CSSProperties = {
      display: "flex",
      // A real browser only honors z-index on a positioned element
      // (position !== static); React Native applies it regardless. Without
      // this, the header content would render behind the blur container.
      position: "relative",
      top: 0,
      height: appLayout.headerButtonHeight,
      flexDirection: "row",
      alignItems: "center",
      zIndex: 2,
    };

    const headerPointerEvents = isBusy ? "none" : "auto";

    return React.createElement(
      "div",
      { style: { ...headerStyle, ...headerShadowStyle } as CSSProperties },
      React.createElement(
        "div",
        {
          style: {
            ...headerStyle,
            pointerEvents: headerPointerEvents,
          } as CSSProperties,
        },
        React.createElement(
          "div",
          {
            id: "wna-header-blur-container",
            style: {
              ...headerStyle,
              zIndex: 1,
              ...blurContainerStyle,
            } as CSSProperties,
          },
          <WnaBlurView
            forceExperimentalBlur
            blurIntensity={30}
            blurTint="systemThickMaterial"
            style={headerStyle}
          />,
          React.createElement("div", {
            id: "wna-header-blur-overlay",
            style: {
              ...headerStyle,
              position: "absolute",
              backgroundColor: appColors.staticWarmgray8,
              pointerEvents: "none",
              ...blurOverlayStyle,
            } as CSSProperties,
          }),
        ),
        React.createElement(
          "div",
          { style: headerContentStyle },
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column" } },
            backButtonVisible
              ? React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      paddingLeft: isLandscape ? 8 : 0,
                    } as CSSProperties,
                  },
                  <WnaButtonHeader
                    text={t(i18nKeys.actionGoBack)}
                    appStyle={appStyle}
                    appColors={appColors}
                    iconName="arrow-left"
                    onPress={handleBack}
                    checkInternetConnection={false}
                  />,
                )
              : React.createElement("div", {
                  style: { width: isLandscape ? 0 : 8 },
                }),
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                flex: 1,
                marginRight: isLandscape ? 8 : 0,
                marginLeft: isRootPage ? 8 : 0,
                overflow: "hidden",
                justifyContent: "center",
              } as CSSProperties,
            },
            WnaMultilineHeader(
              appColors,
              appStyle,
              appLayout,
              isRootPage,
              isLandscape,
              headerTitle,
              handleTitlePress,
            ),
          ),
          React.createElement(
            "div",
            {
              id: "wna-header-actions",
              style: {
                display: "flex",
                flexDirection: "row",
                opacity: isBusy ? 0 : 1,
                paddingRight: 16,
              } as CSSProperties,
            },
            isLandscape ? (
              <WnaButtonHeader
                appStyle={appStyle}
                appColors={appColors}
                text={"Theme"}
                iconName={themeIcon}
                onPress={() =>
                  toggleWnaTheme({
                    colorScheme,
                    theme,
                    setTheme,
                    setAppColors,
                  })
                }
              />
            ) : null,
            headerButton0,
            headerButton1,
            headerButton2,
          ),
        ),
      ),
    );
  },
);

WnaHeader.displayName = "WnaHeader";
