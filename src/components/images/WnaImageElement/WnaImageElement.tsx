import { WnaImageElementProps } from "@components/images/WnaImageElement/WnaImageElementTypes";
import { animationSpeed } from "@constants/animationSpeed";
import { Image } from "expo-image";
import { memo } from "react";
import { ImageStyle as ReactNativeImageStyle } from "react-native";

function WnaImageElement(props: WnaImageElementProps) {
  const webGrayScaleStyle = props.grayScale
    ? ({ filter: "grayscale(100%)" } as ReactNativeImageStyle)
    : undefined;
  const source = props.source ?? props.imageUrl ?? "";

  return (
    <Image
      style={[props.style, webGrayScaleStyle]}
      alt={props.altText}
      accessibilityLabel={props.altText}
      cachePolicy="memory-disk"
      source={source}
      transition={props.overwriteAnimationSpeed ?? animationSpeed}
      contentFit={props.contentFit ?? "cover"}
      priority={props.priority}
      responsivePolicy={props.responsivePolicy}
    />
  );
}

export default memo(WnaImageElement);
