import React, { FC, useState } from "react";
import { flattenStyle } from "@utils/flattenStyle";
import { WnaBasePressableProps } from "./wnaBasePressableProps";
import { WnaBasePressableState } from "./wnaBasePressableState";

const WnaBasePressable: FC<WnaBasePressableProps> = (props) => {
  const [state, setState] = useState<WnaBasePressableState>({
    pressed: false,
    hovered: false,
  });

  const getHoverColor = (ripple: "light" | "dark" | undefined) =>
    ripple === "dark"
      ? "rgba(0,0,0,0.06)"
      : ripple === "light"
        ? "rgba(255,255,255,0.06)"
        : "transparent";

  const getPressedColor = (ripple: "light" | "dark" | undefined) =>
    ripple === "dark"
      ? "rgba(0,0,0,0.08)"
      : ripple === "light"
        ? "rgba(255,255,255,0.08)"
        : "transparent";

  const isEnabled = props.isEnabled ?? true;
  const { hovered, pressed } = state;

  const style = flattenStyle([
    resetStyle,
    styles.base,
    !isEnabled && styles.disabled,
    hovered &&
      !props.disableHover && {
        backgroundColor: getHoverColor(props.ripple),
        opacity: 0.9,
      },
    pressed &&
      !props.disableHover && {
        backgroundColor: getPressedColor(props.ripple),
        opacity: 0.8,
      },
    {
      cursor: isEnabled ? "pointer" : "auto",
    },
    props.baseStyle,
  ]);

  return React.createElement(
    "button",
    {
      type: "button",
      "aria-label": props.accessibilityLabel,
      disabled: !isEnabled,
      onClick: props.onPress,
      onMouseEnter: () => {
        setState((current) => ({ ...current, hovered: true }));
        props.onHoverIn?.();
      },
      onMouseLeave: () => {
        setState({ hovered: false, pressed: false });
        props.onHoverOut?.();
      },
      onMouseDown: () => setState((current) => ({ ...current, pressed: true })),
      onMouseUp: () => setState((current) => ({ ...current, pressed: false })),
      style,
    },
    props.children,
  );
};

const resetStyle: React.CSSProperties = {
  backgroundColor: "transparent",
  borderWidth: 0,
  padding: 0,
  margin: 0,
  textAlign: "inherit",
  display: "flex",
  flexDirection: "column",
};

const styles: { base: React.CSSProperties; disabled: React.CSSProperties } = {
  base: {
    flex: 1,
    opacity: 1,
  },
  disabled: {
    backgroundColor: "rgba(0,0,0,0.02)",
  },
};

export default WnaBasePressable;
