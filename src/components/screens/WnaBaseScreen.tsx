import { convertHexToRgba } from "@/utils/colorConverter";
import {
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
import WnaActivityIndicator from "@components/feedback/WnaActivityIndicator";
import { WnaFooter } from "@components/chrome/WnaFooter";
import { WnaHeader } from "@components/chrome/WnaHeader";
import WnaWebBaseScreen from "@components/screens/WnaWebBaseScreen";
import { Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { FC, ReactNode, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import WnaImageBackground from "@components/images/WnaImageBackground";

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
  documentTitle?: string;
  icon?: string;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  isRootPage?: boolean;
  scrollY?: number;
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
    if (!isBusy && !isBusyText) {
      return null;
    }

    return (
      <View
        nativeID="wna-busy-overlay"
        style={[
          styles.busyOverlay,
          {
            opacity: isBusy ? 1 : 0,
            backgroundColor: convertHexToRgba(appColors.staticBlack, 0.7),
            pointerEvents: isBusy ? "auto" : "none",
            transition: "opacity 250ms cubic-bezier(.5, .01, 0, 1)",
          } as never,
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
      </View>
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
  documentTitle,
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
  const { isAppInitialized, registerNavigationTransitionBackgroundImageUrl } =
    useWnaAppLifecycle();
  const { appColors, appStyle } = useWnaTheme();
  const { appLayout, isLandscape } = useWnaLayout();
  const resolvedBackgroundImageUrl =
    backgroundImageUrl ?? appLayout.backgroundImageUrl;

  useFocusEffect(
    useCallback(() => {
      if (!isAppInitialized) {
        return undefined;
      }

      return registerNavigationTransitionBackgroundImageUrl(
        resolvedBackgroundImageUrl,
      );
    }, [
      isAppInitialized,
      registerNavigationTransitionBackgroundImageUrl,
      resolvedBackgroundImageUrl,
    ]),
  );

  if (!isAppInitialized) return null;

  return (
    // documentTitle overrides the browser tab title without changing the
    // on-screen header (headerTitle) — used for bookmarking-friendly titles.
    <WnaWebBaseScreen title={documentTitle ?? headerTitle}>
      <WnaImageBackground
        testID="screen-background"
        imageUri={resolvedBackgroundImageUrl}
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
