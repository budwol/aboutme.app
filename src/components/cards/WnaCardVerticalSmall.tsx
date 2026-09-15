import {
  WnaBaseCardProps,
  WnaVerticalTextCardContent,
} from "@components/cards/wnaCardTypes";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaBadge from "@components/display/WnaBadge";
import WnaCardTextContent from "@components/cards/WnaCardTextContent";
import { createVerticalCardContainerStyle } from "@components/cards/wnaCardLayoutStyles";
import React, { CSSProperties, FC, memo, ReactNode } from "react";

export type WnaCardVerticalSmallProps = WnaBaseCardProps &
  WnaVerticalTextCardContent & {
    description: string;
    subtitleContent?: ReactNode;
    badgeText?: string;
    width?: number;
    opacity?: number;
    footerContent?: ReactNode;
    onPress?: () => void;
  };

const WnaCardVerticalSmallComponent: FC<WnaCardVerticalSmallProps> = ({
  appColors,
  appStyle,
  title,
  subtitle,
  description,
  subtitleContent,
  badgeText,
  opacity,
  footerContent,
  onPress,
}) => {
  const cardContent = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        ...createVerticalCardContainerStyle(appColors, opacity),
        padding: 14,
        gap: 6,
      } as CSSProperties,
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
        } as CSSProperties,
      },
      React.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } as CSSProperties },
        <WnaCardTextContent
          appColors={appColors}
          appStyle={appStyle}
          title={title}
          subtitle={subtitle}
          subtitleContent={subtitleContent}
        />,
      ),
      badgeText ? (
        <WnaBadge
          appColors={appColors}
          appStyle={appStyle}
          text={badgeText}
          fontColor={appColors.coolgray8}
          style={{
            backgroundColor: appColors.coolgray1,
            height: 28,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 3,
            minHeight: 18,
            opacity: 0.7,
          }}
          textStyle={{ lineHeight: appStyle.textMicro.lineHeight }}
        />
      ) : null,
    ),
    description
      ? React.createElement(
          "span",
          { style: appStyle.textNeutralMicro as CSSProperties },
          description,
        )
      : null,
    footerContent
      ? React.createElement(
          "div",
          { style: { marginTop: 2 } as CSSProperties },
          footerContent,
        )
      : null,
  );

  return onPress ? (
    <WnaPressable onPress={onPress} ripple="dark" style={{ width: "100%" }}>
      {cardContent}
    </WnaPressable>
  ) : (
    cardContent
  );
};

const WnaCardVerticalSmall = memo(
  WnaCardVerticalSmallComponent,
  (prevProps, nextProps) =>
    prevProps.appColors === nextProps.appColors &&
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.subtitleContent === nextProps.subtitleContent &&
    prevProps.description === nextProps.description &&
    prevProps.badgeText === nextProps.badgeText &&
    prevProps.footerContent === nextProps.footerContent &&
    prevProps.width === nextProps.width &&
    prevProps.onPress === nextProps.onPress,
);

WnaCardVerticalSmall.displayName = "WnaCardVerticalSmall";

export default WnaCardVerticalSmall;
