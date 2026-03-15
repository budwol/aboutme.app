import { convertHexToRgba } from "@/utils/colorConverter";
import { getCardBorderStyle } from "@components/cards/wnaCardStyles";
import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { FC, memo, ReactNode } from "react";
import { View } from "react-native";
import { WnaBlurView } from "../misc/WnaBlurView";

export interface IWnaListCardWhiteProps {
  appColors: Colors;
  children?: ReactNode;
  color?: string | null;
  opacity?: number;
}

const WnaListCardWhiteComponent: FC<IWnaListCardWhiteProps> = ({
  appColors,
  children,
  color,
  opacity,
}) => {
  const effectiveOpacity = opacity ?? 1;
  let accentColor = color ?? "transparent";
  if (accentColor !== "transparent" && appColors.isDark) {
    accentColor = convertHexToRgba(accentColor, 0.7);
  }

  return children === null ? null : (
    <WnaBlurView
      blurIntensity={30}
      blurTint={"dark"}
      style={[
        {
          opacity: effectiveOpacity,
          backgroundColor: appColors.white,
          borderRadius: appLayoutConstants.globalCornerRadius,
          ...getCardBorderStyle(appColors),
          overflow: "hidden",
        },
      ]}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ width: 8, backgroundColor: accentColor }} />
        <View
          style={{
            paddingVertical: 24,
            paddingLeft: 16,
            paddingRight: 24,
            width: "100%",
          }}
        >
          {children}
        </View>
      </View>
    </WnaBlurView>
  );
};

const WnaListCardWhite = memo(
  WnaListCardWhiteComponent,
  (prevProps, nextProps) =>
    prevProps.color === nextProps.color &&
    prevProps.appColors === nextProps.appColors &&
    prevProps.children === nextProps.children &&
    prevProps.opacity === nextProps.opacity,
);

WnaListCardWhite.displayName = "WnaListCardWhite";

export default WnaListCardWhite;
