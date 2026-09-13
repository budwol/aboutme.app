import {
  WnaBaseCardProps,
  WnaVerticalTextCardContent,
} from "@components/cards/wnaCardTypes";
import WnaCardTextContent from "@components/cards/WnaCardTextContent";
import { createVerticalCardContainerStyle } from "@components/cards/wnaCardLayoutStyles";
import WnaImage from "@components/images/WnaImage";
import React, { CSSProperties, FC, memo } from "react";

export type WnaCardVerticalImageProps = WnaBaseCardProps &
  Pick<WnaVerticalTextCardContent, "title" | "subtitle"> & {
    contentMinHeight?: number;
    height?: number;
    imageUrl?: string;
    text1?: string;
    text2?: string;
    width?: number;
  };

const WnaCardVerticalImageComponent: FC<WnaCardVerticalImageProps> = ({
  appColors,
  appStyle,
  contentMinHeight,
  height,
  imageUrl,
  text1,
  text2,
  width,
}) => {
  const cardWidth = width ?? 256;
  const cardHeight = height ?? cardWidth * 0.5;

  return React.createElement(
    "div",
    {
      style: {
        ...createVerticalCardContainerStyle(appColors),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: cardWidth,
      } as CSSProperties,
    },
    <WnaImage
      imageTitle={text1 ?? ""}
      appColors={appColors}
      imageUrl={imageUrl ?? ""}
      contentFit={"cover"}
      style={{ width: cardWidth, height: cardHeight }}
    />,
    React.createElement(
      "div",
      { style: { minHeight: contentMinHeight } as CSSProperties },
      <WnaCardTextContent
        appColors={appColors}
        appStyle={appStyle}
        title={text1}
        subtitle={text2}
        subtitleAlign={"center"}
        subtitleMinHeight={52}
        titleAlign={"center"}
        titleMinHeight={40}
        titleNumberOfLines={2}
        titlePaddingHorizontal={12}
        subtitleNumberOfLines={2}
        subtitlePaddingHorizontal={12}
        titlePaddingTop={8}
        bodyPadding={8}
      />,
    ),
  );
};

const WnaCardVerticalImage = memo(
  WnaCardVerticalImageComponent,
  (prevProps, nextProps) =>
    prevProps.appColors === nextProps.appColors &&
    prevProps.contentMinHeight === nextProps.contentMinHeight &&
    prevProps.text1 === nextProps.text1 &&
    prevProps.text2 === nextProps.text2 &&
    prevProps.height === nextProps.height &&
    prevProps.width === nextProps.width &&
    prevProps.imageUrl === nextProps.imageUrl,
);

WnaCardVerticalImage.displayName = "WnaCardVerticalImage";

export default WnaCardVerticalImage;
