import { FC } from "react";
import { Pressable, StyleSheet } from "react-native";
import { WnaPressableProps } from "./WnaPressableProps";
import { WnaPressableState } from "./WnaPressableState";

const WnaBasePressable: FC<WnaPressableProps> = (props) => {
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
  return (
    <Pressable
      disabled={!isEnabled}
      onPress={props.onPress}
      onHoverIn={props.onHoverIn}
      onHoverOut={props.onHoverOut}
      style={({ pressed, hovered }: WnaPressableState) => [
        styles.base,
        !props.isEnabled && styles.disabled,
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
      ]}
    >
      {props.children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    opacity: 1,
  },
  disabled: {
    backgroundColor: "rgba(0,0,0,0.02)",
  },
});

export default WnaBasePressable;
