import WnaButtonIconInnerIcon from "@components/buttons/WnaButtonIconInnerIcon";
import WnaPressable from "@components/buttons/WnaPressable";
import { createRoundIconButtonStyle } from "@components/buttons/wnaButtonStyles";
import {
  WnaButtonActionProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { WnaShadowStyle } from "@components/effects/WnaShadowStyle";
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
  <View style={[WnaShadowStyle(), style as ViewStyle]}>
    <WnaPressable
      ripple={"light"}
      toolTip={toolTip}
      accessibilityLabel={accessibilityLabel ?? toolTip}
      toolTipPosition={toolTipPosition}
      style={createRoundIconButtonStyle(appColors)}
      t={t}
      onPress={onPress}
    >
      <WnaButtonIconInnerIcon
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
