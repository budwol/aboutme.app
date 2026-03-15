import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import { LinearGradient } from "expo-linear-gradient";
import { TFunction } from "i18next";
import { FC, memo } from "react";
import { Text, TextStyle, ViewStyle } from "react-native";

export type WnaFooterProps = {
  appColors: Colors;
  isLandscape: boolean;
  isInternetReachable: boolean | null;
  t: TFunction<string[], undefined>;
  showAppStoreButtons?: boolean;
};

export const WnaFooter: FC<WnaFooterProps> = memo(
  ({ appColors, isLandscape, isInternetReachable, t }) => {
    const currentInfoColor = isInternetReachable
      ? appColors.accent6
      : appColors.red4;

    return (
      <>
        {!isInternetReachable && (
          <LinearGradient
            start={[0, 0]}
            end={[1, 0]}
            colors={[
              convertHexToRgba(appColors.white, 0),
              convertHexToRgba(currentInfoColor, 0),
              currentInfoColor,
              convertHexToRgba(currentInfoColor, 0),
              convertHexToRgba(appColors.white, 0),
            ]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={styles.gradient(isLandscape) as ViewStyle}
          >
            <Text style={styles.text(appColors) as TextStyle}>
              {t(i18nKeys.errorNoInternet).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
      </>
    );
  },
);

WnaFooter.displayName = "WnaFooter";

const styles = {
  gradient: (isLandscape: boolean) => ({
    pointerEvents: "box-none",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: appLayoutConstants.footerHeight,
    justifyContent: "center",
    alignItems: isLandscape ? "flex-end" : "center",
  }),
  text: (appColors: Colors) => ({
    fontSize: 8,
    color: appColors.staticWhite,
    alignSelf: "center",
  }),
} as const;
