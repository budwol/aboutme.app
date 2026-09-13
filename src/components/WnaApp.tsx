import Logger from "@/utils/logger";
import { AppData } from "@/app-data";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { ErrorBoundaryProps, usePathname } from "expo-router";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
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
  return (
    <View style={styles.introCopy}>
      <Text style={[styles.introBrand, { color: appColors.coolgray8 }]}>
        {appData.profile.name}
      </Text>
      <WnaAccentBar appColors={appColors} width={48} />
      <Text style={[styles.introName, { color: appColors.coolgray6 }]}>
        {appData.profile.title.toUpperCase()}
      </Text>
    </View>
  );
}

function WnaNavigationTransitionOverlay({ appColors }: { appColors: Colors }) {
  return (
    <View style={styles.transitionContent}>
      <WnaHeroField appColors={appColors} compact />
      <WnaAccentBar appColors={appColors} animated />
    </View>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation(["common"]);

  useEffect(() => {
    Logger.error(ErrorBoundary.name, error);
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", marginBottom: 12 }}>{error.message}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(i18nKeys.actionRetry)}
        onPress={retry}
        style={styles.retryButton}
      >
        <Text style={styles.retryButtonText}>{t(i18nKeys.actionRetry)}</Text>
      </Pressable>
    </View>
  );
}

export type AppComponentProps = PropsWithChildren<{
  appData: AppData;
  theme: Theme;
}>;

const WnaApp: FC<AppComponentProps> = ({ children, appData, theme }) => {
  const colorScheme = useColorScheme();
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
    const nativeSubscription = resizeTarget
      ? null
      : Dimensions.addEventListener("change", handleChange);
    resizeTarget?.addEventListener("resize", handleChange);

    setDimensions();

    return () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }
      resizeTarget?.removeEventListener("resize", handleChange);
      nativeSubscription?.remove();
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

  function handleContentLayout(_event: LayoutChangeEvent) {
    if (!hasContentLayout) {
      setHasContentLayout(true);
    }
  }

  if (!isAppInitialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorScheme === "dark" ? "#111" : "#fff",
        }}
      />
    );
  }

  return (
    <View nativeID="wna-safe-area" style={{ flex: 1, overflow: "hidden" }}>
      <View
        nativeID={isContentReadyForReveal ? "wna-content-reveal" : undefined}
        onLayout={handleContentLayout}
        style={[
          styles.content,
          !isContentReadyForReveal && styles.contentInitial,
          {
            opacity: isNavigationContentVisible ? 1 : 0,
            transition: `opacity ${appMotionConstants.navigationTransitionDurationOut}ms ease-out`,
          } as never,
        ]}
      >
        {children}
      </View>

      {showIntro ? (
        <View
          nativeID="wna-intro-overlay"
          style={[
            styles.fullScreenOverlay,
            styles.introOverlay,
            {
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
              pointerEvents: "none",
            },
          ]}
        >
          <View style={styles.introContent}>
            <WnaHeroField appColors={appColors} compact />
            <WnaLoadingCopy appColors={appColors} appData={appData} />
          </View>
        </View>
      ) : null}

      {showNavigationTransition ? (
        <View
          nativeID="navigation-transition-overlay"
          style={[
            styles.fullScreenOverlay,
            styles.navigationTransitionOverlay,
            {
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
              pointerEvents: "auto",
              opacity: navigationTransitionPhase === "exit" ? 0 : 1,
              transition: `opacity ${appMotionConstants.navigationTransitionDurationOut}ms ease-out`,
            } as never,
          ]}
        >
          <WnaImageBackground
            testID="navigation-transition-background"
            imageUri={navigationTransitionBackgroundImageUri}
            appColors={appColors}
            isDarkMode={appColors.isDark}
          >
            <WnaNavigationTransitionOverlay appColors={appColors} />
          </WnaImageBackground>
        </View>
      ) : null}

      <WnaToastHost appColors={appColors} />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentInitial: {
    opacity: 0.92,
    transform: [{ translateY: 10 }],
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  introOverlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  navigationTransitionOverlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  introContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  transitionContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    paddingHorizontal: 24,
  },
  introCopy: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
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
    minWidth: 140,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: "white",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#991b1b",
    fontWeight: "700",
  },
});

export default WnaApp;
