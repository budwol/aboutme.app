import WnaButtonTextContent from "@components/buttons/WnaButtonTextContent";
import { createButtonOutlineStyle } from "@components/buttons/wnaButtonStyles";
import {
  WnaButtonActionProps,
  WnaButtonTextAppearanceProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { createShadowStyle } from "@components/effects/wnaShadowStyle";
import {
  actionButtonRightConstants,
  appLayoutConstants,
} from "@constants/layoutConstants";
import { StaticColors } from "@constants/theme/staticColors";
import React, { CSSProperties, FC, memo, useState } from "react";
import { StyleSheet } from "react-native";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";

export type WnaButtonIconTextProps = WnaButtonThemeProps &
  WnaButtonTextAppearanceProps &
  Required<Pick<WnaButtonActionProps, "onPress">> &
  Pick<WnaButtonActionProps, "checkInternetConnection" | "t" | "disabled"> & {
    iconName: keyof typeof iconMap;
    borderWidth?: number;
    style?: CSSProperties;
  };

const WnaButtonIconTextComponent: FC<WnaButtonIconTextProps> = ({
  appColors,
  appStyle,
  text,
  iconName,
  onPress,
  backgroundColor,
  textColor,
  borderWidth,
  style,
  disabled,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const effectiveTextColor = textColor ?? appColors.staticWhite;
  const effectiveBackgroundColor =
    backgroundColor ??
    (appColors.isDark ? appColors.staticWarmgray7 : appColors.staticWarmgray8);
  const effectiveBorderWidth = borderWidth ?? 1;
  const isDisabled = disabled ?? false;

  return React.createElement(
    "button",
    {
      type: "button",
      disabled: isDisabled,
      "aria-disabled": isDisabled,
      onClick: onPress,
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => {
        setIsHovered(false);
        setIsPressed(false);
      },
      style: StyleSheet.flatten({
        ...componentStyle.pressableContainer,
        ...createShadowStyle(),
        ...createButtonOutlineStyle(appColors),
        alignItems: "center",
        appearance: "none",
        backgroundColor: effectiveBackgroundColor,
        borderColor: StaticColors.staticWarmgray6,
        borderStyle: "solid",
        borderWidth: effectiveBorderWidth,
        boxSizing: "border-box",
        cursor: isDisabled ? "not-allowed" : "pointer",
        display: "flex",
        opacity: isDisabled ? 0.5 : isPressed ? 0.8 : isHovered ? 0.9 : 1,
        padding: 0,
        ...StyleSheet.flatten(style),
      }) as React.CSSProperties,
    },
    <WnaButtonTextContent
      appStyle={appStyle}
      text={text}
      textColor={effectiveTextColor}
      childrenLeft={
        <WnaIcon iconName={iconName} size={20} color={effectiveTextColor} />
      }
    />,
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
