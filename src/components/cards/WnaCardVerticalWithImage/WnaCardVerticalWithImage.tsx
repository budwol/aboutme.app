import {
  WnaBaseCardProps,
  WnaVerticalTextCardContent,
} from "@components/cards/wnaCardTypes";
import WnaCardTextContent from "@components/cards/WnaCardTextContent";
import { createVerticalCardContainerStyle } from "@components/cards/wnaCardLayoutStyles";
import WnaImage from "@components/images/WnaImage";
import { FC, memo } from "react";
import { View } from "react-native";

export interface IWnaCardVerticalWithImageProps
  extends
    WnaBaseCardProps,
    Pick<WnaVerticalTextCardContent, "title" | "subtitle"> {
  imageUrl?: string;
  text1?: string;
  text2?: string;
  width?: number;
}

const WnaCardVerticalWithImageComponent: FC<IWnaCardVerticalWithImageProps> = ({
  appColors,
  appStyle,
  imageUrl,
  text1,
  text2,
  width,
}) => {
  const cardWidth = width ?? 256;
  const height = cardWidth * 0.5;

  return (
    <View
      style={{
        ...createVerticalCardContainerStyle(appColors),
        alignItems: "center",
        width: cardWidth,
      }}
    >
      <WnaImage
        imageTitle={text1 ?? ""}
        appColors={appColors}
        imageUrl={imageUrl ?? ""}
        contentFit={"cover"}
        style={{ width: cardWidth, height }}
      />
      <WnaCardTextContent
        appColors={appColors}
        appStyle={appStyle}
        title={text1}
        subtitle={text2}
        titlePaddingTop={8}
        bodyPadding={8}
      />
    </View>
  );
};

const WnaCardVerticalWithImage = memo(
  WnaCardVerticalWithImageComponent,
  (prevProps, nextProps) =>
    prevProps.appColors === nextProps.appColors &&
    prevProps.text1 === nextProps.text1 &&
    prevProps.text2 === nextProps.text2 &&
    prevProps.width === nextProps.width &&
    prevProps.imageUrl === nextProps.imageUrl,
);

WnaCardVerticalWithImage.displayName = "WnaCardVerticalWithImage";

export default WnaCardVerticalWithImage;
