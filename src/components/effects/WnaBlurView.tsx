import { StaticColors } from "@constants/theme/staticColors";
import { convertHexToRgba } from "@utils/colorConverter";
import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";

export type BlurTint =
  | "dark"
  | "light"
  | "default"
  | "extraLight"
  | "systemThickMaterial";

export type WnaBlurViewProps = {
  style?: ViewStyle | ViewStyle[] | null | undefined;
  blurIntensity?: number;
  blurTint: BlurTint;
  backgroundColor?: string;
  backgroundOpacity?: number;
  children?: ReactNode;
  forceExperimentalBlur?: boolean;
  isBackground?: boolean;
};

export function WnaBlurView(props: WnaBlurViewProps) {
  const tint = props.blurTint ?? "dark";
  const normalizedTint = tint.toLowerCase();
  let backgroundColor = "transparent";
  if (props.isBackground) backgroundColor = StaticColors.staticBlack;

  if (!props.forceExperimentalBlur)
    backgroundColor =
      tint === "dark" ? StaticColors.staticBlack : StaticColors.staticWhite;

  if (props.backgroundColor) backgroundColor = props.backgroundColor;

  const backgroundOpacity =
    props.backgroundOpacity ??
    (normalizedTint.includes("dark") || normalizedTint.includes("default")
      ? 0.5
      : 0.8);

  const intensity = props.blurIntensity ?? 30;

  const renderInnerView = (props: WnaBlurViewProps) => {
    return (
      <View
        style={[
          props.style ?? null,
          {
            backgroundColor: convertHexToRgba(
              backgroundColor,
              backgroundOpacity,
            ),
          },
        ]}
      >
        {props.children}
      </View>
    );
  };

  // Expo intensity is a 0-100 scale; CSS blur uses a pixel radius.
  const cssBlurRadius = Math.min(8, Math.max(0, intensity / 5));
  const blurStyle = props.forceExperimentalBlur
    ? ({
        backdropFilter: `blur(${cssBlurRadius}px)`,
        WebkitBackdropFilter: `blur(${cssBlurRadius}px)`,
      } as ViewStyle)
    : null;

  return props.forceExperimentalBlur ? (
    <View style={[props.style ?? null, blurStyle]}>
      {renderInnerView(props)}
    </View>
  ) : (
    renderInnerView(props)
  );
}
