import {
  WnaBaseCardProps,
  WnaVerticalTextCardContent,
} from "@components/cards/wnaCardTypes";
import WnaBadge from "@components/misc/WnaBadge";
import WnaVerticalCardTextContent from "@components/cards/WnaVerticalCardTextContent";
import { createVerticalCardContainerStyle } from "@components/cards/wnaVerticalCardStyles";
import { FC, memo, ReactNode } from "react";
import { Text, View } from "react-native";
export interface IWnaCardSmallVerticalProps
  extends WnaBaseCardProps, WnaVerticalTextCardContent {
  description: string;
  badgeText?: string;
  width?: number;
  opacity?: number;
  footerContent?: ReactNode;
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
}) => (
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
        <WnaVerticalCardTextContent
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

const WnaCardSmallVertical = memo(
  WnaCardSmallVerticalComponent,
  (prevProps, nextProps) =>
    prevProps.appColors === nextProps.appColors &&
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.description === nextProps.description &&
    prevProps.badgeText === nextProps.badgeText &&
    prevProps.footerContent === nextProps.footerContent &&
    prevProps.width === nextProps.width,
);

WnaCardSmallVertical.displayName = "WnaCardSmallVertical";

export default WnaCardSmallVertical;
