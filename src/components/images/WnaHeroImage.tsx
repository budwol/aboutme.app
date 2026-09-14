import React, { CSSProperties, FC } from "react";
import WnaCssGradient from "@components/effects/WnaCssGradient";

import WnaImage, { WnaImageProps } from "@components/images/WnaImage";
import { WnaImageStyle } from "@components/images/WnaImageElement/wnaImageElementTypes";
import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";

interface WnaHeroImageProps extends Pick<
  WnaImageProps,
  "priority" | "responsivePolicy" | "style"
> {
  appColors: Colors;
  imageUrl: string;
  imageTitle: string;
  grayScale?: boolean;
  showGradient?: boolean;
  borderRadius?: number;
}

const WnaHeroImage: FC<WnaHeroImageProps> = ({
  appColors,
  imageUrl,
  imageTitle,
  grayScale = false,
  showGradient = false,
  borderRadius = appLayoutConstants.globalCornerRadius,
  ...imageProps
}) => {
  const imageStyle = imageProps.style as WnaImageStyle | undefined;

  return React.createElement(
    "div",
    {
      style: {
        ...styles.container,
        height: appLayoutConstants.globalHeroImageHeight,
        borderRadius,
        ...flattenStyle(imageStyle),
      } as CSSProperties,
    },
    <WnaImage
      {...imageProps}
      appColors={appColors}
      imageUrl={imageUrl}
      imageTitle={imageTitle}
      contentFit="cover"
      grayScale={grayScale}
      style={[styles.image, imageStyle] as WnaImageStyle[]}
    />,
    showGradient ? (
      <WnaCssGradient
        colors={[
          convertHexToRgba(appColors.staticBlack, 0.24),
          convertHexToRgba(appColors.staticBlack, 0.0),
          convertHexToRgba(appColors.staticBlack, 0.55),
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          mixBlendMode: "multiply",
        }}
      />
    ) : null,
  );
};

function flattenStyle(style: WnaImageStyle): CSSProperties {
  if (!Array.isArray(style)) return (style || {}) as CSSProperties;
  return style.reduce<CSSProperties>(
    (result, entry) => Object.assign(result, flattenStyle(entry)),
    {},
  );
}

const styles = {
  container: {
    width: "100%",
    overflow: "hidden",
    // The optional gradient overlay below is `position: absolute`; RN Views
    // are implicitly `position: relative` (DOM divs default to `static`),
    // so this needs to be explicit to keep the gradient anchored here.
    position: "relative",
  },
  image: {
    width: "100%",
    height: appLayoutConstants.globalHeroImageHeight,
  },
} satisfies Record<string, CSSProperties>;

export default WnaHeroImage;
