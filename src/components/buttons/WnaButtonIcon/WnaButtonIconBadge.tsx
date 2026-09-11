import { convertHexToRgba } from "@/utils/colorConverter";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { actionButtonRightConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { FC, memo } from "react";
import { View, ViewStyle } from "react-native";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";

export type WnaButtonIconBadgeProps = {
  appColors: Colors;
  appStyle: AppStyle;
  iconName?: keyof typeof iconMap;
  color?: string;
  style?: ViewStyle;
  size?: number;
};

const _borderRadius = actionButtonRightConstants.size / 2;
const _iconSize = actionButtonRightConstants.size * 0.45;

const WnaButtonIconBadgeComponent: FC<WnaButtonIconBadgeProps> = ({
  appColors,
  appStyle,
  iconName,
  color,
  size,
}) => {
  const defaultColor = convertHexToRgba(appColors.staticBlack, 0.6);
  const effectiveSize = size ?? actionButtonRightConstants.size;

  return (
    <View
      style={[
        appStyle.containerCenterCenter,
        {
          width: effectiveSize,
          height: effectiveSize,
          maxWidth: effectiveSize,
          maxHeight: effectiveSize,
          backgroundColor: defaultColor,
          borderRadius: _borderRadius,
        },
      ]}
    >
      <WnaIcon
        iconName={iconName ?? "cube"}
        size={_iconSize}
        color={color ?? appColors.staticWhite}
      />
    </View>
  );
};

const WnaButtonIconBadge = memo(
  WnaButtonIconBadgeComponent,
  (prevProps, nextProps) =>
    prevProps.appColors.isDark === nextProps.appColors.isDark &&
    prevProps.color === nextProps.color &&
    prevProps.iconName === nextProps.iconName,
);

WnaButtonIconBadge.displayName = "WnaButtonIconBadge";

export default WnaButtonIconBadge;
