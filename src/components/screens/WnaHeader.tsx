import { WnaShadowStyle } from "@components/misc/WnaShadowStyle";
import { getNavigationPath } from "@components/navigation/wnaNavigationRouteProvider";
import { useWnaLayout, useWnaTheme } from "@components/WnaAppContext";
import { animationSpeed } from "@constants/animationSpeed";
import { Href, useRouter } from "expo-router";
import { FC, memo, ReactNode, useCallback, useEffect } from "react";
import { useColorScheme, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import WnaButtonHeader from "../buttons/WnaButtonHeader";
import { WnaBlurView } from "../misc/WnaBlurView";
import WnaMultilineHeader from "@components/screens/WnaMultilineHeader";
import {
  getThemeFromStorageAsync,
  setThemeToStorageAsync,
} from "@services/wnaAsyncStorageProvider";
import Toast from "react-native-toast-message";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { getNextTheme, resolveAppColors } from "@utils/themeColors";

export type WnaHeaderProps = {
  headerTitle?: string;
  icon?: string;
  isRootPage?: boolean;
  isBusy?: boolean;
  askBeforeBack?: boolean;
  backHref?: Href;
  titleHref?: Href;
  preventBack?: boolean;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  scrollY?: SharedValue<number>;
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
    const router = useRouter();
    const { appColors, appStyle, setAppColors, theme, setTheme } =
      useWnaTheme();
    const { appLayout, isLandscape } = useWnaLayout();
    const colorScheme = useColorScheme();

    const themeIcon =
      theme === "dark"
        ? ("moon-waning-crescent" as keyof typeof iconMap)
        : theme === "light"
          ? ("white-balance-sunny" as keyof typeof iconMap)
          : "theme-light-dark";

    const lazyOpacity = useSharedValue(1);

    useEffect(() => {
      lazyOpacity.value = withTiming(isBusy ? 0 : 1, {
        duration: animationSpeed,
        easing: Easing.bezier(0.5, 0.01, 0, 1),
      });
    }, [isBusy, lazyOpacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: lazyOpacity.value,
    }));

    const headerShadowStyle = useAnimatedStyle(() => {
      const scrollValue = scrollY?.value ?? 0;
      const baseOpacity = Math.min(0.4, Math.max(0, scrollValue / 1000));
      // ease the shadow in nice and slow so the header does not slap you in the face
      const shadowOpacity =
        showShadow === true
          ? 1
          : showShadow === false
            ? 0
            : baseOpacity >= 0.4
              ? 1
              : baseOpacity;

      return WnaShadowStyle(shadowOpacity);
    }, [scrollY, showShadow]);

    const blurContainerStyle = useAnimatedStyle(() => {
      const scrollValue = scrollY?.value ?? 0;
      const baseOpacity = Math.min(0.4, Math.max(0, scrollValue / 1000));
      // same trick here, just a little fog rolling in as you scroll
      const calculatedBlur = Math.min(1, Math.max(0, baseOpacity * 2.4));
      const blurOpacity =
        showShadow === true && calculatedBlur < 0.2 ? 0.2 : calculatedBlur;

      return {
        opacity: blurOpacity,
      };
    }, [scrollY, showShadow]);

    const blurOverlayStyle = useAnimatedStyle(() => {
      const scrollValue = scrollY?.value ?? 0;
      const baseOpacity = Math.min(0.4, Math.max(0, scrollValue / 1000));

      return {
        opacity: baseOpacity,
      };
    }, [scrollY]);

    const handleBack = useCallback(() => {
      if (isBusy) return;

      if (backHref) {
        router.replace(backHref);
        return;
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate(getNavigationPath("root"));
      }
    }, [backHref, router, isBusy]);

    const handleTitlePress = useCallback(() => {
      if (isBusy) return;

      if (onTitlePress) {
        onTitlePress();
        return;
      }

      if (titleHref) {
        router.replace(titleHref);
        return;
      }

      handleBack();
    }, [handleBack, isBusy, onTitlePress, router, titleHref]);

    const toggleTheme = async () => {
      const currentTheme = (await getThemeFromStorageAsync()) ?? theme;
      const nextTheme = getNextTheme(currentTheme);
      const nextColors = resolveAppColors(nextTheme, colorScheme);

      setAppColors(nextColors);
      setTheme(nextTheme);

      Toast.show({ type: "info", text1: `theme: ${nextTheme}` });

      await setThemeToStorageAsync(nextTheme);
    };

    const backButtonVisible =
      !isRootPage && (Boolean(backHref) || router.canGoBack());

    const headerStyle: ViewStyle = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: appLayout.headerHeight,
      justifyContent: isLandscape ? "center" : "flex-end",
    };

    const headerContentStyle: ViewStyle = {
      top: 0,
      height: appLayout.headerButtonHeight,
      flexDirection: "row",
      alignItems: "center",
      zIndex: 2,
      elevation: 2,
    };

    const headerPointerEvents = isBusy ? "none" : "auto";

    return (
      <Animated.View style={[headerStyle, headerShadowStyle]}>
        <Animated.View
          style={[
            headerStyle,
            {
              pointerEvents: headerPointerEvents as ViewStyle["pointerEvents"],
            },
          ]}
        >
          <Animated.View
            style={[
              headerStyle,
              { zIndex: 1, elevation: 1 },
              blurContainerStyle,
            ]}
          >
            <WnaBlurView
              forceExperimentalBlur
              blurIntensity={30}
              blurTint="systemThickMaterial"
              style={headerStyle}
            />
            <Animated.View
              style={[
                headerStyle,
                {
                  position: "absolute",
                  backgroundColor: appColors.staticWarmgray8,
                  pointerEvents: "none",
                },
                blurOverlayStyle,
              ]}
            />
          </Animated.View>

          <View style={headerContentStyle}>
            <View>
              {backButtonVisible ? (
                <View style={{ paddingLeft: isLandscape ? 8 : 0 }}>
                  <WnaButtonHeader
                    text="Back"
                    appStyle={appStyle}
                    appColors={appColors}
                    iconName="arrow-left"
                    onPress={handleBack}
                    checkInternetConnection={false}
                  />
                </View>
              ) : (
                <View style={{ width: isLandscape ? 0 : 8 }} />
              )}
            </View>

            <View
              style={{
                flex: 1,
                marginRight: isLandscape ? 8 : 0,
                marginLeft: isRootPage ? 8 : 0,
                overflow: "hidden",
                justifyContent: "center",
              }}
            >
              {WnaMultilineHeader(
                appColors,
                appStyle,
                appLayout,
                isRootPage,
                isLandscape,
                headerTitle,
                handleTitlePress,
              )}
            </View>

            <Animated.View
              style={[
                animatedStyle,
                { flexDirection: "row", paddingRight: 16 },
              ]}
            >
              <WnaButtonHeader
                appStyle={appStyle}
                appColors={appColors}
                text={"Theme"}
                iconName={themeIcon}
                onPress={() => toggleTheme()}
              />
              {headerButton0}
              {headerButton1}
              {headerButton2}
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  },
);

WnaHeader.displayName = "WnaHeader";
