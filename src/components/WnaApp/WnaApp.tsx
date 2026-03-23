import Toast, { ToastConfig } from "react-native-toast-message";
import { AppData } from "@/app-data";
import {
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { ErrorBoundaryProps, usePathname } from "expo-router";
import {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
} from "@components/WnaAppContext";
import { appMotionConstants } from "@constants/motionConstants";
import { Theme } from "@/storage/themeStorage";
import Colors from "@constants/theme/colors";
import { resolveAppColors } from "@utils/themeColors";
import { WnaHeroField } from "@components/sections/WnaProfileHero";
import { convertHexToRgba } from "@utils/colorConverter";
import WnaAccentBar from "@components/display/WnaAccentBar";

type WnaLoadingCopyProps = {
  appColors: Colors;
  appData: AppData;
};

function WnaLoadingCopy({ appColors, appData }: WnaLoadingCopyProps) {
  return (
    <View style={styles.introCopy}>
      <Text style={[styles.introBrand, { color: appColors.coolgray8 }]}>
        {appData.profile.name}
      </Text>
      <WnaAccentBar appColors={appColors} animated />
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
      <Text style={{ color: "white" }} onPress={retry}>
        retry
      </Text>
    </View>
  );
}

export type AppComponentProps = PropsWithChildren<{
  appData: AppData;
  theme: Theme;
}>;

function renderToastCard(appColors: Colors, text1?: string, text2?: string) {
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 328,
        minHeight: 78,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: appColors.isDark
          ? convertHexToRgba(appColors.coolgray4, 0.3)
          : convertHexToRgba(appColors.coolgray2, 0.78),
        backgroundColor: appColors.isDark
          ? convertHexToRgba(appColors.background, 0.98)
          : convertHexToRgba(appColors.white, 0.98),
        paddingHorizontal: 18,
        paddingVertical: 16,
        shadowColor: appColors.staticBlack,
        shadowOpacity: appColors.isDark ? 0.24 : 0.12,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 7,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "stretch",
          gap: 14,
          flex: 1,
        }}
      >
        <View
          style={{
            width: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 4,
              alignSelf: "stretch",
              minHeight: 42,
              borderRadius: 999,
              backgroundColor: appColors.accent5,
              shadowColor: appColors.accent5,
              shadowOpacity: appColors.isDark ? 0.28 : 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        </View>

        <View
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: "center",
            paddingVertical: 2,
          }}
        >
          {text1 ? (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.1,
                textTransform: "uppercase",
                color: appColors.isDark
                  ? convertHexToRgba(appColors.coolgray8, 0.64)
                  : appColors.coolgray6,
              }}
            >
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text
              style={{
                marginTop: text1 ? 7 : 0,
                fontSize: 17,
                lineHeight: 23,
                fontWeight: "700",
                letterSpacing: 0.15,
                color: appColors.isDark ? appColors.coolgray8 : appColors.black,
              }}
            >
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

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
    setIsAppInitialized,
  } = useWnaAppLifecycle();
  const { setDimensions } = useWnaLayout();
  const { appColors, setAppColors, setTheme } = useWnaTheme();
  const { setAppData } = useWnaAppData();

  const toastConfig = useMemo<ToastConfig>(
    () => ({
      themeChange: ({ text1, text2, props }) =>
        renderToastCard(
          (props?.appColors as Colors) ?? appColors,
          text1,
          text2,
        ),
      success: ({ text1, text2, props }) =>
        renderToastCard(
          (props?.appColors as Colors) ?? appColors,
          text1,
          text2,
        ),
      info: ({ text1, text2, props }) =>
        renderToastCard(
          (props?.appColors as Colors) ?? appColors,
          text1,
          text2,
        ),
      error: ({ text1, text2, props }) =>
        renderToastCard(
          (props?.appColors as Colors) ?? appColors,
          text1,
          text2,
        ),
    }),
    [appColors],
  );

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

    // set the initial layout once on mount
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
          pointerEvents="none"
          style={[
            styles.introOverlay,
            {
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
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
          pointerEvents="auto"
          style={[
            styles.introOverlay,
            {
              backgroundColor: appColors.isDark ? "#111111" : "#f8f7f3",
            },
            navigationTransitionAnimatedStyle,
          ]}
        >
          <WnaNavigationTransitionOverlay appColors={appColors} />
        </Animated.View>
      ) : null}

      <Toast config={toastConfig} position="top" topOffset={18} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
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
    gap: 10,
    paddingHorizontal: 24,
  },
  introBrand: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  introName: {
    fontSize: 13,
    letterSpacing: 1.8,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

export default WnaApp;
