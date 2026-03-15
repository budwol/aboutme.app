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
import { SeoEntry } from "@constants/seoCatalog";
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
  seoEntry: SeoEntry;
  icon?: string;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  isRootPage?: boolean;
  scrollY?: SharedValue<number>;
  showHeaderShadow?: boolean;
  showAppStoreButtons?: boolean;
};

type WnaBaseScreenChromeProps = Pick<
  WnaBaseScreenProps,
  | "askBeforeBack"
  | "headerButton0"
  | "headerButton1"
  | "headerButton2"
  | "icon"
  | "isRootPage"
  | "preventBack"
  | "scrollY"
  | "seoEntry"
  | "showAppStoreButtons"
  | "showHeaderShadow"
> & {
  appColors: ReturnType<typeof useWnaTheme>["appColors"];
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
    askBeforeBack,
    headerButton0,
    headerButton1,
    headerButton2,
    icon,
    isLandscape,
    isRootPage,
    preventBack,
    scrollY,
    seoEntry,
    showAppStoreButtons,
    showHeaderShadow,
    t,
  }: WnaBaseScreenChromeProps) => {
    return (
      <>
        <WnaHeader
          seoEntry={seoEntry}
          icon={icon}
          preventBack={preventBack}
          askBeforeBack={askBeforeBack}
          isRootPage={isRootPage}
          scrollY={scrollY}
          headerButton0={headerButton0}
          headerButton1={headerButton1}
          headerButton2={headerButton2}
          showShadow={showHeaderShadow}
        />

        <WnaFooter
          t={t}
          appColors={appColors}
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
  seoEntry,
  icon,
  headerButton0,
  headerButton1,
  headerButton2,
  isRootPage,
  scrollY,
  showHeaderShadow,
  showAppStoreButtons,
}) => {
  const { t } = useTranslation(["common"]);
  const { isAppInitialized } = useWnaAppLifecycle();
  const { appColors, appStyle } = useWnaTheme();
  const { appLayout, isLandscape } = useWnaLayout();

  if (!isAppInitialized) return null;

  return (
    <WnaWebBaseScreen seoEntry={seoEntry}>
      <WnaImageBackground
        imageUri={backgroundImageUrl ?? appLayout.backgroundImageUrl}
        appColors={appColors}
      >
        <View style={styles.container}>
          <View style={styles.content}>{children}</View>

          <WnaBaseScreenChrome
            appColors={appColors}
            askBeforeBack={askBeforeBack}
            headerButton0={headerButton0}
            headerButton1={headerButton1}
            headerButton2={headerButton2}
            icon={icon}
            isLandscape={isLandscape}
            isRootPage={isRootPage}
            preventBack={preventBack}
            scrollY={scrollY}
            seoEntry={seoEntry}
            showAppStoreButtons={showAppStoreButtons}
            showHeaderShadow={showHeaderShadow}
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
