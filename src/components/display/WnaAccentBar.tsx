import Colors from "@constants/theme/colors";
import { createShadowStyle } from "@components/effects/wnaShadowStyle";
import { useEffect, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type WnaAccentBarProps = {
  appColors: Colors;
  animated?: boolean;
  width?: number;
  pulseToWidth?: number;
  pulseDuration?: number;
};

function useWnaAccentBarAnimation(
  width: number,
  animated: boolean,
  pulseToWidth: number | undefined,
  pulseDuration: number,
) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(animated && pulseToWidth === undefined);
  }, [animated, pulseToWidth, width]);

  if (pulseToWidth !== undefined) {
    return {
      "--wna-accent-bar-pulse-scale": pulseToWidth / width,
      animation: `wna-accent-bar-pulse ${pulseDuration * 2}ms ease-in-out infinite alternate`,
    } as ViewStyle;
  }

  return {
    width: isCollapsed ? 8 : width,
    transition: animated
      ? "width 820ms cubic-bezier(0.33, 1, 0.68, 1)"
      : undefined,
  } as ViewStyle;
}

export default function WnaAccentBar({
  appColors,
  animated = false,
  width = 220,
  pulseToWidth,
  pulseDuration = 3600,
}: WnaAccentBarProps) {
  const barAnimatedStyle = useWnaAccentBarAnimation(
    width,
    animated,
    pulseToWidth,
    pulseDuration,
  );

  return (
    <View style={[styles.row, { width }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: appColors.accent5,
            ...createShadowStyle(2.25, appColors.accent5),
          },
          barAnimatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    justifyContent: "center",
  },
  bar: {
    width: 220,
    height: 8,
    borderRadius: 999,
  },
});
