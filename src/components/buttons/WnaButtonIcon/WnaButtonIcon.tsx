import WnaButtonIconBadge from "@components/buttons/WnaButtonIcon/WnaButtonIconBadge";
import WnaPressable from "@components/buttons/WnaPressable";
import { createRoundIconButtonStyle } from "@components/buttons/wnaButtonStyles";
import {
  WnaButtonActionProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { createShadowStyle } from "@components/effects/wnaShadowStyle";
import { FC, memo } from "react";
import { View, ViewStyle } from "react-native";

export type WnaButtonIconProps = WnaButtonThemeProps &
  Required<Pick<WnaButtonThemeProps, "appStyle">> &
  Required<Pick<WnaButtonActionProps, "onPress">> &
  Pick<WnaButtonActionProps, "checkInternetConnection" | "t"> & {
    iconName?: keyof typeof iconMap;
    toolTip?: string;
    accessibilityLabel?: string;
    color?: string;
    style?: object;
    toolTipPosition?: "top" | "right" | "bottom" | "left" | undefined;
  };

const WnaButtonIconComponent: FC<WnaButtonIconProps> = ({
  appColors,
  appStyle,
  iconName,
  onPress,
  t,
  toolTip,
  accessibilityLabel,
  color,
  style,
  toolTipPosition,
}) => (
  <View style={[createShadowStyle(), style as ViewStyle]}>
    <WnaPressable
      ripple={"light"}
      toolTip={toolTip}
      accessibilityLabel={accessibilityLabel ?? toolTip}
      toolTipPosition={toolTipPosition}
      style={createRoundIconButtonStyle(appColors)}
      t={t}
      onPress={onPress}
    >
      <WnaButtonIconBadge
        appStyle={appStyle}
        appColors={appColors}
        color={color}
        iconName={iconName}
      />
    </WnaPressable>
  </View>
);

const WnaButtonIcon = memo(WnaButtonIconComponent);

WnaButtonIcon.displayName = "WnaButtonIcon";

export default WnaButtonIcon;
