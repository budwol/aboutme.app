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
  contentMinHeight?: number;
  height?: number;
  imageUrl?: string;
  text1?: string;
  text2?: string;
  width?: number;
}

const WnaCardVerticalWithImageComponent: FC<IWnaCardVerticalWithImageProps> = ({
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
        style={{ width: cardWidth, height: cardHeight }}
      />
      <View style={{ minHeight: contentMinHeight }}>
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
        />
      </View>
    </View>
  );
};

const WnaCardVerticalWithImage = memo(
  WnaCardVerticalWithImageComponent,
  (prevProps, nextProps) =>
    prevProps.appColors === nextProps.appColors &&
    prevProps.contentMinHeight === nextProps.contentMinHeight &&
    prevProps.text1 === nextProps.text1 &&
    prevProps.text2 === nextProps.text2 &&
    prevProps.height === nextProps.height &&
    prevProps.width === nextProps.width &&
    prevProps.imageUrl === nextProps.imageUrl,
);

WnaCardVerticalWithImage.displayName = "WnaCardVerticalWithImage";

export default WnaCardVerticalWithImage;
