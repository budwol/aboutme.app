import {
  WnaBaseCardProps,
  WnaVerticalTextCardContent,
} from "@components/cards/wnaCardTypes";
import WnaVerticalCardTextContent from "@components/cards/WnaVerticalCardTextContent";
import { createVerticalCardContainerStyle } from "@components/cards/wnaVerticalCardStyles";
import { FC, memo } from "react";
import { View } from "react-native";
export interface IWnaCardSmallVerticalProps
  extends WnaBaseCardProps, WnaVerticalTextCardContent {
  description: string;
  width?: number;
  opacity?: number;
}

const WnaCardSmallVerticalComponent: FC<IWnaCardSmallVerticalProps> = ({
  appColors,
  title,
  subtitle,
  description,
  opacity,
}) => (
  <View
    style={{
      ...createVerticalCardContainerStyle(appColors, opacity),
      padding: 14,
      gap: 6,
    }}
  >
    <WnaVerticalCardTextContent
      appColors={appColors}
      title={title}
      subtitle={subtitle}
      description={description}
    />
  </View>
);

const WnaCardSmallVertical = memo(
  WnaCardSmallVerticalComponent,
  (prevProps, nextProps) =>
    prevProps.appColors === nextProps.appColors &&
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.description === nextProps.description &&
    prevProps.width === nextProps.width,
);

WnaCardSmallVertical.displayName = "WnaCardSmallVertical";

export default WnaCardSmallVertical;
