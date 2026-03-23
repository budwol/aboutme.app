import Colors from "@constants/theme/colors";
import { WnaShadowStyle } from "@components/effects/WnaShadowStyle";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
  pulseToWidth?: number,
  pulseDuration = 3600,
) {
  const barWidth = useSharedValue(width);
  const barScale = useSharedValue(1);

  useEffect(() => {
    barWidth.value = width;
    barScale.value = 1;

    if (pulseToWidth !== undefined) {
      barScale.value = withRepeat(
        withSequence(
          withTiming(pulseToWidth / width, {
            duration: pulseDuration,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, {
            duration: pulseDuration,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      );
      return;
    }

    if (!animated) {
      return;
    }

    barWidth.value = withTiming(8, {
      duration: 820,
      easing: Easing.out(Easing.cubic),
    });
  }, [animated, barScale, barWidth, pulseDuration, pulseToWidth, width]);

  return useAnimatedStyle(() => {
    if (pulseToWidth !== undefined) {
      return {
        transform: [{ scaleX: barScale.value }],
      };
    }

    return {
      width: barWidth.value,
    };
  });
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
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: appColors.accent5,
            ...WnaShadowStyle(2.25, appColors.accent5),
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
