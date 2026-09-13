import WnaBasePressable from "@components/buttons/WnaBasePressable/WnaBasePressable";
import WnaTooltip from "@components/effects/WnaTooltip";
import { TFunction } from "i18next";
import React, { CSSProperties, FC, ReactNode, useRef, useState } from "react";
import { StyleSheet } from "react-native";

export type WnaPressableState = Readonly<{
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}>;

export type WnaPressableProps = {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  toolTip?: string;
  toolTipPosition?: "top" | "right" | "bottom" | "left" | undefined;
  style?: CSSProperties | CSSProperties[];
  baseStyle?: CSSProperties | CSSProperties[];
  ripple: "light" | "dark" | undefined;
  disableHover?: boolean;
  disabled?: boolean;
};

const WnaPressable: FC<WnaPressableProps> = (props) => {
  const [isToolTipVisible, setIsToolTipVisible] = useState(false);
  const toolTip = props.toolTip ?? "";
  const toolTipPosition = props.toolTipPosition;
  const [isEnabled, setIsEnabled] = useState(true);
  const isEnabledRef = useRef(true);
  const onPress = async () => {
    if (props.disabled || !isEnabledRef.current) return;

    setIsEnabled(false);
    isEnabledRef.current = false;

    props.onPress();

    setTimeout(() => {
      setIsEnabled(true);
      isEnabledRef.current = true;
    }, 500);
  };
  const hasTooltip = Boolean(toolTip && toolTipPosition);
  const flattenedStyle = StyleSheet.flatten(props.style);
  return React.createElement(
    "div",
    {
      style: StyleSheet.flatten([
        { display: "flex", flexDirection: "column" },
        { overflow: "visible", position: "relative" },
        props.style,
      ]) as React.CSSProperties,
    },
    hasTooltip && (
      <WnaTooltip
        content={toolTip}
        position={toolTipPosition!}
        visible={isToolTipVisible}
      />
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          borderRadius: flattenedStyle?.borderRadius,
          flex: 1,
          overflow: "hidden",
        } as React.CSSProperties,
      },
      <WnaBasePressable
        accessibilityLabel={props.accessibilityLabel}
        ripple={props.ripple}
        baseStyle={props.baseStyle}
        onPress={onPress}
        isEnabled={isEnabled && !props.disabled}
        onHoverIn={() => setIsToolTipVisible(true)}
        onHoverOut={() => setIsToolTipVisible(false)}
        disableHover={props.disableHover}
        checkInternetConnection={props.checkInternetConnection}
      >
        {props.children}
      </WnaBasePressable>,
    ),
  );
};
export default WnaPressable;
