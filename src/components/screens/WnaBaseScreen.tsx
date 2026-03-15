import { convertHexToRgba } from "@/utils/colorConverter";
import {
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaActivityIndicator from "@components/misc/WnaActivityIndicator";
import { WnaFooter } from "@components/screens/WnaFooter";
import { WnaHeader } from "@components/screens/WnaHeader";
import WnaWebBaseScreen from "@components/screens/WnaWebBaseScreen";
import { animationSpeed } from "@constants/animationSpeed";
import { Href } from "expo-router";
import { FC, ReactNode, memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import WnaImageBackground from "../images/WnaImageBackground";

export type WnaBaseScreenProps = {
  children?: ReactNode;
  isBusy?: boolean;
  isBusyText?: string | null;
  backgroundImageUrl?: string;
  onCancel?: () => void;
  preventBack?: boolean;
  askBeforeBack?: boolean;
  backHref?: Href;
  titleHref?: Href;
  headerTitle?: string;
  icon?: string;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  isRootPage?: boolean;
  scrollY?: SharedValue<number>;
  showHeaderShadow?: boolean;
  showAppStoreButtons?: boolean;
  onTitlePress?: () => void;
};

type WnaBaseScreenChromeProps = Pick<
  WnaBaseScreenProps,
  | "askBeforeBack"
  | "backHref"
  | "titleHref"
  | "headerButton0"
  | "headerButton1"
  | "headerButton2"
  | "icon"
  | "isRootPage"
  | "preventBack"
  | "scrollY"
  | "headerTitle"
  | "showAppStoreButtons"
  | "showHeaderShadow"
  | "onTitlePress"
> & {
  appColors: ReturnType<typeof useWnaTheme>["appColors"];
  appStyle: ReturnType<typeof useWnaTheme>["appStyle"];
  isLandscape: boolean;
  t: ReturnType<typeof useTranslation>["t"];
};

type WnaBusyOverlayProps = {
  appColors: ReturnType<typeof useWnaTheme>["appColors"];
  appStyle: ReturnType<typeof useWnaTheme>["appStyle"];
  isBusy: boolean;
  isBusyText?: string | null;
};

const WnaBaseScreenChrome = memo(
  ({
    appColors,
    appStyle,
    askBeforeBack,
    backHref,
    titleHref,
    headerTitle,
    headerButton0,
    headerButton1,
    headerButton2,
    icon,
    isLandscape,
    isRootPage,
    preventBack,
    scrollY,
    showAppStoreButtons,
    showHeaderShadow,
    onTitlePress,
    t,
  }: WnaBaseScreenChromeProps) => {
    return (
      <>
        <WnaHeader
          headerTitle={headerTitle}
          icon={icon}
          preventBack={preventBack}
          askBeforeBack={askBeforeBack}
          backHref={backHref}
          titleHref={titleHref}
          isRootPage={isRootPage}
          scrollY={scrollY}
          headerButton0={headerButton0}
          headerButton1={headerButton1}
          headerButton2={headerButton2}
          showShadow={showHeaderShadow}
          onTitlePress={onTitlePress}
        />

        <WnaFooter
          t={t}
          appColors={appColors}
          appStyle={appStyle}
          isLandscape={isLandscape}
          isInternetReachable
          showAppStoreButtons={showAppStoreButtons}
        />
      </>
    );
  },
);

WnaBaseScreenChrome.displayName = "WnaBaseScreenChrome";

const WnaBusyOverlay = memo(
  ({ appColors, appStyle, isBusy, isBusyText }: WnaBusyOverlayProps) => {
    const busyOpacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: withTiming(busyOpacity.value, {
        duration: animationSpeed,
        easing: Easing.bezier(0.5, 0.01, 0, 1),
      }),
    }));

    useEffect(() => {
      busyOpacity.value = isBusy ? 1 : 0;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBusy]);

    if (!isBusy && !isBusyText) {
      return null;
    }

    return (
      <Animated.View
        pointerEvents={isBusy ? "auto" : "none"}
        style={[
          styles.busyOverlay,
          {
            backgroundColor: convertHexToRgba(appColors.staticBlack, 0.7),
          },
          animatedStyle,
        ]}
      >
        <WnaActivityIndicator appColors={appColors} />

        {Boolean(isBusyText) && (
          <Text
            style={[
              appStyle.textTitleLarge,
              styles.busyText,
              { color: appColors.black },
            ]}
          >
            {isBusyText}
          </Text>
        )}
      </Animated.View>
    );
  },
);

WnaBusyOverlay.displayName = "WnaBusyOverlay";

const WnaBaseScreen: FC<WnaBaseScreenProps> = ({
  children,
  isBusy = false,
  isBusyText,
  backgroundImageUrl,
  preventBack,
  askBeforeBack,
  backHref,
  titleHref,
  headerTitle,
  icon,
  headerButton0,
  headerButton1,
  headerButton2,
  isRootPage,
  scrollY,
  showHeaderShadow,
  showAppStoreButtons,
  onTitlePress,
}) => {
  const { t } = useTranslation(["common"]);
  const { isAppInitialized } = useWnaAppLifecycle();
  const { appColors, appStyle } = useWnaTheme();
  const { appLayout, isLandscape } = useWnaLayout();

  if (!isAppInitialized) return null;

  return (
    <WnaWebBaseScreen title={headerTitle}>
      <WnaImageBackground
        imageUri={backgroundImageUrl ?? appLayout.backgroundImageUrl}
        appColors={appColors}
        isDarkMode={appColors.isDark}
      >
        <View style={styles.container}>
          <View style={styles.content}>{children}</View>

          <WnaBaseScreenChrome
            appColors={appColors}
            appStyle={appStyle}
            askBeforeBack={askBeforeBack}
            backHref={backHref}
            titleHref={titleHref}
            headerTitle={headerTitle}
            headerButton0={headerButton0}
            headerButton1={headerButton1}
            headerButton2={headerButton2}
            icon={icon}
            isLandscape={isLandscape}
            isRootPage={isRootPage}
            preventBack={preventBack}
            scrollY={scrollY}
            showAppStoreButtons={showAppStoreButtons}
            showHeaderShadow={showHeaderShadow}
            onTitlePress={onTitlePress}
            t={t}
          />

          <WnaBusyOverlay
            appColors={appColors}
            appStyle={appStyle}
            isBusy={isBusy}
            isBusyText={isBusyText}
          />
        </View>
      </WnaImageBackground>
    </WnaWebBaseScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "stretch",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignContent: "stretch",
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  busyText: {
    margin: 16,
    textAlign: "center",
  },
});

export default memo(WnaBaseScreen);
