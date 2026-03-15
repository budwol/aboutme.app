import { WnaImageElementProps } from "@components/images/WnaImageElement/WnaImageElementTypes";
import { animationSpeed } from "@constants/animationSpeed";
import { Image } from "expo-image";
import { memo } from "react";
import { ImageStyle as ReactNativeImageStyle } from "react-native";

function WnaImageElement(props: WnaImageElementProps) {
  const webGrayScaleStyle = props.grayScale
    ? ({ filter: "grayscale(100%)" } as ReactNativeImageStyle)
    : undefined;

  return (
    <Image
      style={[props.style, webGrayScaleStyle]}
      alt={props.altText}
      accessibilityLabel={props.altText}
      cachePolicy="memory-disk"
      source={props.imageUrl}
      transition={props.overwriteAnimationSpeed ?? animationSpeed}
      contentFit={props.contentFit ?? "cover"}
    />
  );
}

export default memo(WnaImageElement);
