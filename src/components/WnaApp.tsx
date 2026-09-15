import Logger from "@/utils/logger";
import { AppData } from "@/app-data";
import { useBrowserColorScheme } from "@utils/useBrowserColorScheme";
import { ErrorBoundaryProps, usePathname } from "expo-router";
import React, {
  CSSProperties,
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useWnaAppData,
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
import { appMotionConstants } from "@constants/motionConstants";
import { Theme } from "@/storage/themeStorage";
import Colors from "@constants/theme/colors";
import { FontFamilies } from "@constants/theme/fontFamilies";
import { resolveAppColors } from "@utils/themeColors";
import { WnaHeroField } from "@components/sections/WnaProfileHero";
import WnaAccentBar from "@components/display/WnaAccentBar";
import WnaImageBackground from "@components/images/WnaImageBackground";
import WnaToastHost from "@components/feedback/WnaToastHost";
import { i18nKeys } from "@/i18n/i18nKeys";
import { useTranslation } from "react-i18next";

type WnaLoadingCopyProps = {
  appColors: Colors;
  appData: AppData;
};

// Keep this in visual sync with the pre-hydration static shell in
// scripts/inject-web-shell.cjs (buildStaticShellStyle/buildStaticShell) --
// see adr/0019-splash-shell-and-intro-overlay-must-match.md. That script
// can't import this component, so the font sizes/weights/spacing and the
// accent-bar size/color are hand-duplicated there on purpose.
function WnaLoadingCopy({ appColors, appData }: WnaLoadingCopyProps) {
  return React.createElement(
    "div",
    { style: styles.introCopy },
    React.createElement(
      "span",
      {
        style: {
          ...styles.introBrand,
          color: appColors.coolgray8,
        } as CSSProperties,
      },
      appData.profile.name,
    ),
    <WnaAccentBar appColors={appColors} width={48} />,
    React.createElement(
      "span",
      {
        style: {
          ...styles.introName,
          color: appColors.coolgray6,
        } as CSSProperties,
      },
      appData.profile.title.toUpperCase(),
    ),
  );
}

function WnaNavigationTransitionOverlay({ appColors }: { appColors: Colors }) {
  return React.createElement(
    "div",
    { style: styles.transitionContent },
    <WnaHeroField appColors={appColors} compact />,
    <WnaAccentBar appColors={appColors} animated />,
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation(["common"]);

  useEffect(() => {
    Logger.error(ErrorBoundary.name, error);
  }, [error]);

  return React.createElement(
    "div",
    {
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
      } as CSSProperties,
    },
    React.createElement(
      "span",
      { style: { color: "white", marginBottom: 12 } as CSSProperties },
      error.message,
    ),
    React.createElement(
      "button",
      {
        type: "button",
        "aria-label": t(i18nKeys.actionRetry),
        onClick: retry,
        style: styles.retryButton as CSSProperties,
      },
      React.createElement(
        "span",
        { style: styles.retryButtonText as CSSProperties },
        t(i18nKeys.actionRetry),
      ),
    ),
  );
}

export type AppComponentProps = PropsWithChildren<{
  appData: AppData;
  theme: Theme;
}>;

const WnaApp: FC<AppComponentProps> = ({ children, appData, theme }) => {
  const colorScheme = useBrowserColorScheme();
  const pathname = usePathname();
  const dimensionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealFrameRef = useRef<number | null>(null);
  const navigationRevealFrameRef = useRef<number | null>(null);
  const navigationFinishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const introFinishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const previousPathnameRef = useRef(pathname);
  const [showIntro, setShowIntro] = useState(true);
  const [showNavigationTransition, setShowNavigationTransition] =
    useState(false);
  const [isNavigationContentVisible, setIsNavigationContentVisible] =
    useState(true);
  const [navigationTransitionPhase, setNavigationTransitionPhase] = useState<
    "enter" | "exit"
  >("enter");
  const [hasContentLayout, setHasContentLayout] = useState(false);
  const [isContentReadyForReveal, setIsContentReadyForReveal] = useState(false);
  const {
    finishNavigationTransition,
    isAppInitialized,
    isNavigationTransitionActive,
    navigationTransitionBackgroundImageUrl,
    setIsAppInitialized,
  } = useWnaAppLifecycle();
  const { appLayout, setDimensions } = useWnaLayout();
  const { appColors, setAppColors, setTheme } = useWnaTheme();
  const { setAppData } = useWnaAppData();

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById("wna-static-shell")?.remove();
  }, []);

  useEffect(() => {
    const handleChange = () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }

      dimensionTimerRef.current = setTimeout(() => {
        setDimensions();
      }, 100);
    };

    const resizeTarget =
      typeof window !== "undefined" &&
      typeof window.addEventListener === "function"
        ? window
        : null;
    resizeTarget?.addEventListener("resize", handleChange);

    setDimensions();

    return () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }
      resizeTarget?.removeEventListener("resize", handleChange);
    };
  }, [setDimensions]);

  useEffect(() => {
    setTheme(theme);
    setAppData(appData);
    setAppColors(resolveAppColors(theme, colorScheme));
    setIsAppInitialized(true);
  }, [
    appData,
    colorScheme,
    setAppColors,
    setAppData,
    setIsAppInitialized,
    setTheme,
    theme,
  ]);

  useEffect(() => {
    setHasContentLayout(true);
  }, []);

  useEffect(() => {
    if (!hasContentLayout || isContentReadyForReveal) {
      return;
    }

    revealFrameRef.current = requestAnimationFrame(() => {
      revealFrameRef.current = requestAnimationFrame(() => {
        setIsContentReadyForReveal(true);
      });
    });

    return () => {
      /* istanbul ignore else -- revealFrameRef.current is assigned synchronously by the requestAnimationFrame call above in the same effect run that registers this cleanup, so it can never be null when the cleanup runs */
      if (revealFrameRef.current !== null) {
        cancelAnimationFrame(revealFrameRef.current);
      }
    };
  }, [hasContentLayout, isContentReadyForReveal]);

  useEffect(() => {
    if (!isNavigationTransitionActive || showIntro) {
      return;
    }

    setShowNavigationTransition(true);
    setIsNavigationContentVisible(false);
    setNavigationTransitionPhase("enter");
  }, [isNavigationTransitionActive, showIntro]);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (
      previousPathname === pathname ||
      !isNavigationTransitionActive ||
      showIntro
    ) {
      return;
    }

    navigationRevealFrameRef.current = requestAnimationFrame(() => {
      navigationRevealFrameRef.current = requestAnimationFrame(() => {
        setIsNavigationContentVisible(true);
        setNavigationTransitionPhase("exit");
        navigationFinishTimerRef.current = setTimeout(() => {
          setShowNavigationTransition(false);
          finishNavigationTransition();
        }, appMotionConstants.navigationTransitionDurationOut);
      });
    });

    return () => {
      /* istanbul ignore else -- navigationRevealFrameRef.current is assigned synchronously by the requestAnimationFrame call above in the same effect run that registers this cleanup, so it can never be null when the cleanup runs */
      if (navigationRevealFrameRef.current !== null) {
        cancelAnimationFrame(navigationRevealFrameRef.current);
      }
      /* istanbul ignore else -- the timer is assigned after the exit phase state update and may not exist when React cleans up this effect */
      if (navigationFinishTimerRef.current !== null) {
        clearTimeout(navigationFinishTimerRef.current);
      }
    };
  }, [
    finishNavigationTransition,
    isNavigationTransitionActive,
    pathname,
    showIntro,
  ]);

  useEffect(() => {
    if (!isAppInitialized || !showIntro) {
      return;
    }

    if (!isContentReadyForReveal) {
      return;
    }

    introFinishTimerRef.current = setTimeout(
      () => setShowIntro(false),
      appMotionConstants.introDelay + appMotionConstants.introDuration,
    );

    return () => {
      /* istanbul ignore else -- the timer can be cleared by the effect cleanup before its delayed callback runs */
      if (introFinishTimerRef.current !== null) {
        clearTimeout(introFinishTimerRef.current);
      }
    };
  }, [isAppInitialized, isContentReadyForReveal, showIntro]);

  const navigationTransitionBackgroundImageUri =
    navigationTransitionBackgroundImageUrl &&
    navigationTransitionBackgroundImageUrl.trim() !== ""
      ? navigationTransitionBackgroundImageUrl
      : appLayout.backgroundImageUrl;

  if (!isAppInitialized) {
    return React.createElement("div", {
      style: {
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#111" : "#fff",
      } as CSSProperties,
    });
  }

  return React.createElement(
    "div",
    {
      id: "wna-safe-area",
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      } as CSSProperties,
    },
    React.createElement(
      "div",
      {
        id: isContentReadyForReveal ? "wna-content-reveal" : undefined,
        style: {
          ...styles.content,
          ...(!isContentReadyForReveal ? styles.contentInitial : {}),
          opacity: isNavigationContentVisible ? 1 : 0,
          transition: `opacity ${appMotionConstants.navigationTransitionDurationOut}ms ease-out`,
        } as CSSProperties,
      },
      children,
    ),
    showIntro
      ? React.createElement(
          "div",
          {
            id: "wna-intro-overlay",
            style: {
              ...styles.fullScreenOverlay,
              ...styles.introOverlay,
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
              pointerEvents: "none",
            } as CSSProperties,
          },
          React.createElement(
            "div",
            { style: styles.introContent as CSSProperties },
            <WnaHeroField appColors={appColors} compact />,
            <WnaLoadingCopy appColors={appColors} appData={appData} />,
          ),
        )
      : null,
    showNavigationTransition
      ? React.createElement(
          "div",
          {
            id: "navigation-transition-overlay",
            style: {
              ...styles.fullScreenOverlay,
              ...styles.navigationTransitionOverlay,
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
              pointerEvents: "auto",
              opacity: navigationTransitionPhase === "exit" ? 0 : 1,
              transition: `opacity ${appMotionConstants.navigationTransitionDurationOut}ms ease-out`,
            } as CSSProperties,
          },
          <WnaImageBackground
            testID="navigation-transition-background"
            imageUri={navigationTransitionBackgroundImageUri}
            appColors={appColors}
            isDarkMode={appColors.isDark}
          >
            <WnaNavigationTransitionOverlay appColors={appColors} />
          </WnaImageBackground>,
        )
      : null,
    <WnaToastHost appColors={appColors} />,
  );
};

const absoluteFillObject: CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const styles = {
  content: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  },
  contentInitial: {
    opacity: 0.92,
    transform: "translateY(10px)",
  },
  fullScreenOverlay: {
    ...absoluteFillObject,
    zIndex: 20,
  },
  introOverlay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationTransitionOverlay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  introContent: {
    ...absoluteFillObject,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 24,
  },
  transitionContent: {
    ...absoluteFillObject,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    paddingInline: 24,
  },
  introCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingInline: 24,
  },
  introBrand: {
    fontFamily: FontFamilies.UI,
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
  },
  introName: {
    fontFamily: FontFamilies.UI,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.75,
    textAlign: "center",
    textTransform: "uppercase",
  },
  retryButton: {
    display: "flex",
    flexDirection: "column",
    minWidth: 140,
    paddingInline: 20,
    paddingBlock: 12,
    borderRadius: 4,
    backgroundColor: "white",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#991b1b",
    fontWeight: "700",
  },
} satisfies Record<string, CSSProperties>;

export default WnaApp;
