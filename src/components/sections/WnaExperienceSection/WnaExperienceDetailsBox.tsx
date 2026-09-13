import React, { ReactNode, useId, useState } from "react";
import { LayoutChangeEvent, View, ViewStyle } from "react-native";
import {
  detailsHeightBuffer,
  detailsTopSpacing,
  styles,
} from "./wnaExperienceSectionStyles";

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
  const detailsId = useId();
  const targetHeight = isExpanded
    ? contentHeight + detailsTopSpacing + detailsHeightBuffer
    : 0;

  function handleLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight !== contentHeight) {
      setContentHeight(nextHeight);
    }
  }

  return (
    <View
      nativeID={`wna-experience-details-${detailsId}`}
      style={[styles.detailsClip, { height: targetHeight } as ViewStyle]}
    >
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
    </View>
  );
}
