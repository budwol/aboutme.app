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
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
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
  const previousPathnameRef = useRef(pathname);
  const [showIntro, setShowIntro] = useState(true);
  const [showNavigationTransition, setShowNavigationTransition] =
    useState(false);
  const [hasContentLayout, setHasContentLayout] = useState(false);
  const [isContentReadyForReveal, setIsContentReadyForReveal] = useState(false);
  const introOpacity = useSharedValue(1);
  const introTranslateY = useSharedValue(0);
  const introScale = useSharedValue(1);
  const navigationTransitionOpacity = useSharedValue(0);
  const navigationTransitionScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0.92);
  const contentTranslateY = useSharedValue(10);

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

    const subscription = Dimensions.addEventListener("change", handleChange);

    setDimensions();

    return () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }
      subscription.remove();
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
    navigationTransitionOpacity.value = 0;
    navigationTransitionScale.value = 1;

    navigationTransitionOpacity.value = withTiming(1, {
      duration: appMotionConstants.navigationTransitionDurationIn,
      easing: Easing.out(Easing.cubic),
    });
  }, [
    isNavigationTransitionActive,
    navigationTransitionOpacity,
    navigationTransitionScale,
    showIntro,
  ]);

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
        navigationTransitionOpacity.value = withTiming(
          0,
          {
            duration: appMotionConstants.navigationTransitionDurationOut,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (!finished) {
              return;
            }

            runOnJS(setShowNavigationTransition)(false);
            runOnJS(finishNavigationTransition)();
          },
        );
      });
    });

    return () => {
      /* istanbul ignore else -- navigationRevealFrameRef.current is assigned synchronously by the requestAnimationFrame call above in the same effect run that registers this cleanup, so it can never be null when the cleanup runs */
      if (navigationRevealFrameRef.current !== null) {
        cancelAnimationFrame(navigationRevealFrameRef.current);
      }
    };
  }, [
    finishNavigationTransition,
    isNavigationTransitionActive,
    navigationTransitionOpacity,
    navigationTransitionScale,
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

    contentOpacity.value = withDelay(
      appMotionConstants.introDelay,
      withTiming(1, {
        duration: appMotionConstants.introDuration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    contentTranslateY.value = withDelay(
      appMotionConstants.introDelay,
      withTiming(0, {
        duration: appMotionConstants.introDuration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    introOpacity.value = withDelay(
      appMotionConstants.introDelay,
      withTiming(0, {
        duration: appMotionConstants.introDuration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    introTranslateY.value = withDelay(
      appMotionConstants.introDelay,
      withTiming(-18, {
        duration: appMotionConstants.introDuration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    introScale.value = withDelay(
      appMotionConstants.introDelay,
      withTiming(
        1.03,
        {
          duration: appMotionConstants.introDuration,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          runOnJS(setShowIntro)(false);
        },
      ),
    );
  }, [
    contentOpacity,
    contentTranslateY,
    introOpacity,
    introScale,
    introTranslateY,
    isAppInitialized,
    isContentReadyForReveal,
    showIntro,
  ]);

  const introAnimatedStyle = useAnimatedStyle(() => ({
    opacity: introOpacity.value,
    transform: [
      { translateY: introTranslateY.value },
      { scale: introScale.value },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));
  const navigationTransitionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: navigationTransitionOpacity.value,
    transform: [{ scale: navigationTransitionScale.value }],
  }));
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
    <SafeAreaView
      style={{ flex: 1, overflow: "hidden" }}
      edges={["left", "right", "bottom"]}
    >
      <Animated.View
        onLayout={handleContentLayout}
        style={[styles.content, contentAnimatedStyle]}
      >
        {children}
      </Animated.View>

      {showIntro ? (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            styles.introOverlay,
            {
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
              pointerEvents: "none",
            },
            introAnimatedStyle,
          ]}
        >
          <View style={styles.introContent}>
            <WnaHeroField appColors={appColors} compact />
            <WnaLoadingCopy appColors={appColors} appData={appData} />
          </View>
        </Animated.View>
      ) : null}

      {showNavigationTransition ? (
        <Animated.View
          nativeID="navigation-transition-overlay"
          testID="navigation-transition-overlay"
          style={[
            styles.fullScreenOverlay,
            styles.navigationTransitionOverlay,
            {
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
              pointerEvents: "auto",
            },
            navigationTransitionAnimatedStyle,
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
        </Animated.View>
      ) : null}

      <WnaToastHost appColors={appColors} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
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
