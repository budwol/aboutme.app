import { StaticColors } from "@constants/theme/staticColors";
import { convertHexToRgba } from "@utils/colorConverter";
import { BlurTint, BlurView } from "expo-blur";
import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";

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

  return (
    <>
      {props.forceExperimentalBlur ? (
        <BlurView
          key={tint}
          style={[props.style ?? null]}
          experimentalBlurMethod={"dimezisBlurView"}
          tint={tint}
          intensity={intensity}
        >
          {renderInnerView(props)}
        </BlurView>
      ) : (
        renderInnerView(props)
      )}
    </>
  );
}
