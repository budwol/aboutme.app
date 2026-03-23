import WnaButtonTextContent from "@components/buttons/WnaButtonTextContent";
import WnaPressable from "@components/buttons/WnaPressable";
import { createButtonOutlineStyle } from "@components/buttons/wnaButtonStyles";
import {
  WnaButtonActionProps,
  WnaButtonTextAppearanceProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { WnaShadowStyle } from "@components/effects/WnaShadowStyle";
import {
  actionButtonRightConstants,
  appLayoutConstants,
} from "@constants/layoutConstants";
import { StaticColors } from "@constants/theme/staticColors";
import { FC, memo } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";

export type WnaButtonIconTextProps = WnaButtonThemeProps &
  WnaButtonTextAppearanceProps &
  Required<Pick<WnaButtonActionProps, "onPress">> &
  Pick<WnaButtonActionProps, "checkInternetConnection" | "t" | "disabled"> & {
    iconName: keyof typeof iconMap;
    borderWidth?: number;
    style?: ViewStyle;
  };

const WnaButtonIconTextComponent: FC<WnaButtonIconTextProps> = ({
  appColors,
  text,
  iconName,
  onPress,
  backgroundColor,
  textColor,
  borderWidth,
  style,
  disabled,
}) => {
  const effectiveTextColor = textColor ?? appColors.staticWhite;
  const effectiveBackgroundColor =
    backgroundColor ??
    (appColors.isDark ? appColors.staticWarmgray7 : appColors.staticWarmgray8);
  const effectiveBorderWidth = borderWidth ?? 1;
  const isDisabled = disabled ?? false;

  return (
    <WnaPressable
      disabled={isDisabled}
      ripple={"light"}
      style={[
        WnaShadowStyle(),
        componentStyle.pressableContainer,
        {
          backgroundColor: effectiveBackgroundColor,
          borderColor: StaticColors.staticWarmgray6,
          borderWidth: effectiveBorderWidth,
          ...createButtonOutlineStyle(appColors),
          pointerEvents: isDisabled ? "none" : "auto",
        },
        isDisabled ? { opacity: 0.5 } : {},
        style ?? {},
      ]}
      onPress={onPress}
    >
      <WnaButtonTextContent
        text={text}
        textColor={effectiveTextColor}
        childrenLeft={
          <WnaIcon iconName={iconName} size={20} color={effectiveTextColor} />
        }
      />
    </WnaPressable>
  );
};

const componentStyle = StyleSheet.create({
  pressableContainer: {
    height: actionButtonRightConstants.size,
    borderRadius: appLayoutConstants.globalCornerRadius,
    overflow: "hidden",
    marginHorizontal: 16,
  },
});

const WnaButtonIconText = memo(WnaButtonIconTextComponent);

WnaButtonIconText.displayName = "WnaButtonIconText";

export default WnaButtonIconText;
