import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";
import { FontFamilies } from "@constants/theme/fontFamilies";
import { fallbackHtml } from "@constants/htmlConstants";
import { LinearGradient } from "expo-linear-gradient";
import { CSSProperties, FC, memo } from "react";
import { Platform } from "react-native";
import RenderHtml, {
  defaultSystemFonts,
  MixedStyleDeclaration,
} from "react-native-render-html";

export type WnaHtmlRendererProps = {
  appColors: Colors;
  appStyle: AppStyle;
  width: number;
  maxHeight?: number;
  html?: string;
  padding?: number;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
};

const WnaHtmlRendererComponent: FC<WnaHtmlRendererProps> = ({
  appColors,
  appStyle,
  width,
  maxHeight,
  html,
  padding,
  fontFamily,
  fontSize,
  fontColor,
}) => {
  const effectivePadding = padding ?? 0;
  const effectiveFontSize = fontSize ?? 14;
  const effectiveFontFamily = fontFamily ?? FontFamilies.UI;
  const effectiveFontColor = fontColor ?? appColors.coolgray6;
  const systemFonts = [
    ...defaultSystemFonts,
    FontFamilies.MonoSpace,
    FontFamilies.UI,
  ];
  const isMaxHeightSet = maxHeight ?? false;
  const overlayHeight = maxHeight ?? 1;
  const nativeStyles: Readonly<Record<string, MixedStyleDeclaration>> = {
    body: {
      padding: effectivePadding,
      color: effectiveFontColor,
      fontFamily: effectiveFontFamily,
      fontSize: effectiveFontSize,
      lineHeight: appStyle.textSmall.lineHeight,
    },
    a: {
      color: effectiveFontColor,
    },
    p: {
      fontSize: appStyle.textSmall.fontSize,
      lineHeight: appStyle.textSmall.lineHeight! * 2,
      color: appStyle.textSmall.color,
      fontWeight: appStyle.textSmall.fontWeight,
      marginBottom: 24,
    },
    ul: {
      listStyleType: "none",
      marginBottom: 24,
    },
    li: {
      fontSize: appStyle.textSmall.fontSize,
      lineHeight: appStyle.textSmall.lineHeight! * 2,
      color: appStyle.textSmall.color,
      fontWeight: appStyle.textSmall.fontWeight,
      marginBottom: 24,
    },
    h1: {
      fontSize: appStyle.textNeutralLarge.fontSize,
      lineHeight: appStyle.textNeutralLarge.lineHeight! * 3,
      color: appStyle.textNeutralLarge.color,
      fontWeight: appStyle.textNeutralLarge.fontWeight,
    },
    h2: {
      fontSize: appStyle.textNeutralTitleLarge.fontSize,
      lineHeight: appStyle.textNeutralTitleLarge.lineHeight! * 3,
      color: appStyle.textNeutralTitleLarge.color,
      fontWeight: appStyle.textNeutralTitleLarge.fontWeight,
      marginVertical: 8,
    },
    h3: {
      fontSize: appStyle.textNeutralMedium.fontSize,
      lineHeight: appStyle.textNeutralMedium.lineHeight! * 3,
      color: appStyle.textNeutralMedium.color,
      fontWeight: appStyle.textNeutralMedium.fontWeight,
    },
  };

  const webStyles: CSSProperties = {
    padding: effectivePadding,
    fontFamily: effectiveFontFamily,
    fontSize: effectiveFontSize,
    lineHeight: 1.5,
    backgroundColor: "transparent",
    color: effectiveFontColor,
  };

  const effectiveHtml = html === "" ? fallbackHtml : html;

  return (
    <>
      {Platform.OS === "web" ? (
        <div
          style={webStyles}
          dangerouslySetInnerHTML={{ __html: effectiveHtml ?? "" }}
        ></div>
      ) : (
        <RenderHtml
          source={{ html: effectiveHtml ?? "" }}
          contentWidth={width}
          tagsStyles={nativeStyles}
          systemFonts={systemFonts}
        />
      )}
      {isMaxHeightSet ? (
        <LinearGradient
          start={[1, 1]}
          end={[1, 0]}
          colors={[appColors.white, "transparent"]}
          style={{
            pointerEvents: "none",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: overlayHeight / 2,
          }}
        />
      ) : null}
    </>
  );
};

const WnaHtmlRenderer = memo(
  WnaHtmlRendererComponent,
  (prevProps, nextProps) =>
    prevProps.html === nextProps.html &&
    prevProps.appColors.isDark === nextProps.appColors.isDark,
);

WnaHtmlRenderer.displayName = "WnaHtmlRenderer";

export default WnaHtmlRenderer;
