import React, { ReactNode, useEffect, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { detailsHeightBuffer, detailsTopSpacing, styles } from "./styles";

type WnaExperienceDetailsBoxProps = {
  isExpanded: boolean;
  backgroundColor: string;
  borderColor: string;
  children: ReactNode;
};

export default function WnaExperienceDetailsBox({
  isExpanded,
  backgroundColor,
  borderColor,
  children,
}: WnaExperienceDetailsBoxProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withTiming(
      isExpanded ? contentHeight + detailsTopSpacing + detailsHeightBuffer : 0,
      {
        duration: 220,
      },
    );
  }, [animatedHeight, contentHeight, isExpanded]);

  function handleLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight !== contentHeight) {
      setContentHeight(nextHeight);
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View style={[styles.detailsClip, animatedStyle]}>
      <View
        onLayout={handleLayout}
        style={[
          styles.detailsBox,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {children}
      </View>
    </Animated.View>
  );
}
