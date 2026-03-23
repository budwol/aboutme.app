import {
  WnaBaseCardProps,
  WnaVerticalTextCardContent,
} from "@components/cards/wnaCardTypes";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaBadge from "@components/display/WnaBadge";
import WnaCardTextContent from "@components/cards/WnaCardTextContent";
import { createVerticalCardContainerStyle } from "@components/cards/wnaCardLayoutStyles";
import { FC, memo, ReactNode } from "react";
import { Text, View } from "react-native";
export interface IWnaCardSmallVerticalProps
  extends WnaBaseCardProps, WnaVerticalTextCardContent {
  description: string;
  badgeText?: string;
  width?: number;
  opacity?: number;
  footerContent?: ReactNode;
  onPress?: () => void;
}

const WnaCardSmallVerticalComponent: FC<IWnaCardSmallVerticalProps> = ({
  appColors,
  appStyle,
  title,
  subtitle,
  description,
  badgeText,
  opacity,
  footerContent,
  onPress,
}) => {
  const cardContent = (
    <View
      style={{
        ...createVerticalCardContainerStyle(appColors, opacity),
        padding: 14,
        gap: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <WnaCardTextContent
            appColors={appColors}
            appStyle={appStyle}
            title={title}
            subtitle={subtitle}
          />
        </View>

        {badgeText ? (
          <WnaBadge
            appColors={appColors}
            appStyle={appStyle}
            text={badgeText}
            fontColor={appColors.coolgray8}
            style={{
              backgroundColor: appColors.coolgray1,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 3,
              minHeight: 18,
              opacity: 0.7,
            }}
            textStyle={{ lineHeight: appStyle.textMicro.lineHeight }}
          />
        ) : null}
      </View>

      {!!description ? (
        <Text style={appStyle.textNeutralMicro}>{description}</Text>
      ) : null}

      {footerContent ? (
        <View style={{ marginTop: 2 }}>{footerContent}</View>
      ) : null}
    </View>
  );

  return onPress ? (
    <WnaPressable onPress={onPress} ripple="dark" style={{ width: "100%" }}>
      {cardContent}
    </WnaPressable>
  ) : (
    cardContent
  );
};

const WnaCardSmallVertical = memo(
  WnaCardSmallVerticalComponent,
  (prevProps, nextProps) =>
    prevProps.appColors === nextProps.appColors &&
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.description === nextProps.description &&
    prevProps.badgeText === nextProps.badgeText &&
    prevProps.footerContent === nextProps.footerContent &&
    prevProps.width === nextProps.width &&
    prevProps.onPress === nextProps.onPress,
);

WnaCardSmallVertical.displayName = "WnaCardSmallVertical";

export default WnaCardSmallVertical;
