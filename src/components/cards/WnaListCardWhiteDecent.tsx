import {
  getCardBorderStyle,
  getGroupedCardRadius,
} from "@components/cards/wnaCardStyles";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { FC, memo, ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { WnaBlurView } from "../misc/WnaBlurView";

export type WnaListCardWhiteDecentProps = {
  appColors: Colors;
  children: ReactNode;
  stateColor?: string;
  type?: "first" | "last" | "middle" | "standalone" | undefined;
  minHeight?: number;
  theme?: "transparentLight" | "light" | "transparentDark" | "dark" | undefined;
  overflow?: "hidden" | "visible" | "auto";
  blur?: boolean;
};

const WnaListCardWhiteDecentComponent: FC<WnaListCardWhiteDecentProps> = ({
  appColors,
  children,
  stateColor,
  type,
  minHeight,
  theme,
  overflow,
}) => {
  const effectiveType = type ?? "standalone";
  const effectiveTheme =
    theme ?? (appColors.isDark ? "transparentDark" : "transparentLight");

  let backgroundColor = "";
  switch (effectiveTheme) {
    case "transparentLight":
      backgroundColor = convertHexToRgba(appColors.staticWhite, 0.6);
      break;
    case "light":
      backgroundColor = appColors.staticWhite;
      break;
    case "transparentDark":
      backgroundColor = convertHexToRgba(appColors.staticBlack, 0.1);
      break;
    case "dark":
      backgroundColor = appColors.staticBlack;
      break;
  }

  let blurViewTint: "dark" | "extraLight" = appColors.isDark
    ? "dark"
    : "extraLight";
  if (effectiveTheme === "transparentLight") blurViewTint = "extraLight";
  if (effectiveTheme === "light") blurViewTint = "extraLight";
  if (effectiveTheme === "transparentDark") blurViewTint = "dark";
  if (effectiveTheme === "dark") blurViewTint = "dark";

  return (
    <WnaBlurView
      blurIntensity={appColors.isDark ? 50 : 100}
      blurTint={blurViewTint}
      style={
        {
          ...getGroupedCardRadius(effectiveType),
          ...getCardBorderStyle(appColors),

          borderTopWidth:
            effectiveType === "first" || effectiveType === "standalone" ? 1 : 0,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          minHeight: minHeight ?? "auto",
          overflow: overflow ?? "hidden",
        } as ViewStyle
      }
    >
      <View
        style={{
          flex: 1,
          ...getGroupedCardRadius(effectiveType),
          flexDirection: "row",
          backgroundColor: backgroundColor,
        }}
      >
        <View
          style={{
            width: 8,
            backgroundColor: stateColor ?? "transparent",
          }}
        />
        <View
          style={{
            padding: 12,
            marginLeft: -8,
            width: "100%",
          }}
        >
          {children}
        </View>
      </View>
    </WnaBlurView>
  );
};

const WnaListCardWhiteDecent = memo(WnaListCardWhiteDecentComponent);

WnaListCardWhiteDecent.displayName = "WnaListCardWhiteDecent";

export default WnaListCardWhiteDecent;
