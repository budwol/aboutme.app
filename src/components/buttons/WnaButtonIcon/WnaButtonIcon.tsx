import WnaButtonIconBadge from "@components/buttons/WnaButtonIcon/WnaButtonIconBadge";
import { createRoundIconButtonStyle } from "@components/buttons/wnaButtonStyles";
import {
  WnaButtonActionProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { createShadowStyle } from "@components/effects/wnaShadowStyle";
import WnaTooltip from "@components/effects/WnaTooltip";
import React, { CSSProperties, FC, memo, useState } from "react";
import { flattenStyle } from "@utils/flattenStyle";

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
  toolTip,
  accessibilityLabel,
  color,
  style,
  toolTipPosition,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonStyle = createRoundIconButtonStyle(appColors);
  const interactionColor = isPressed
    ? "rgba(255,255,255,0.14)"
    : isHovered
      ? "rgba(255,255,255,0.08)"
      : buttonStyle.backgroundColor;

  return React.createElement(
    "div",
    {
      style: flattenStyle([
        { position: "relative" },
        createShadowStyle(),
        style as CSSProperties,
      ]),
    },
    toolTip && toolTipPosition ? (
      <WnaTooltip
        content={toolTip}
        position={toolTipPosition}
        visible={isHovered}
      />
    ) : null,
    React.createElement(
      "button",
      {
        type: "button",
        "aria-label": accessibilityLabel ?? toolTip,
        onClick: onPress,
        onMouseDown: () => setIsPressed(true),
        onMouseUp: () => setIsPressed(false),
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => {
          setIsHovered(false);
          setIsPressed(false);
        },
        style: {
          ...buttonStyle,
          appearance: "none",
          backgroundColor: interactionColor,
          boxSizing: "border-box",
          borderStyle: "solid",
          cursor: "pointer",
          overflow: "hidden",
          padding: 0,
        } as React.CSSProperties,
      },
      <WnaButtonIconBadge
        appStyle={appStyle}
        appColors={appColors}
        color={color}
        iconName={iconName}
      />,
    ),
  );
};

const WnaButtonIcon = memo(WnaButtonIconComponent);

WnaButtonIcon.displayName = "WnaButtonIcon";

export default WnaButtonIcon;
