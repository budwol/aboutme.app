import { isHtml, stripHtml } from "@/utils/htmlSanitizer";
import WnaHtmlRenderer from "@components/misc/WnaHtmlRenderer";
import Colors from "@constants/theme/colors";
import AppStyle from "@services/wnaStyleService";
import { FC, memo } from "react";
import { Text, TextStyle } from "react-native";

export type WnaTextProps = {
  appColors: Colors;
  appStyle: AppStyle;
  text?: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
  ellipseMode?: "clip" | "head" | "middle" | "tail";
  textBreakStrategy?: "balanced" | "simple" | "highQuality";
  showHtml?: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  maxHeight?: number;
};

const WnaTextComponent: FC<WnaTextProps> = ({
  appColors,
  appStyle,
  text,
  style,
  numberOfLines,
  ellipseMode,
  textBreakStrategy,
  showHtml,
  fontFamily,
  fontSize,
  fontColor,
  maxHeight,
}) => {
  const shouldShowHtml = showHtml ?? isHtml(text);
  const effectiveNumberOfLines = numberOfLines ?? 0;
  const effectiveEllipseMode = ellipseMode ?? "clip";
  const effectiveTextBreakStrategy = textBreakStrategy ?? "simple";
  const effectiveFontColor = fontColor ?? appColors.black;

  return shouldShowHtml ? (
    <WnaHtmlRenderer
      appStyle={appStyle}
      appColors={appColors}
      width={2048}
      maxHeight={maxHeight}
      html={text}
      fontFamily={fontFamily}
      fontSize={fontSize}
      fontColor={effectiveFontColor}
    />
  ) : (
    <Text
      style={[
        style ? style : appStyle.textNeutralSmall,
        {
          color: effectiveFontColor,
        },
      ]}
      textBreakStrategy={effectiveTextBreakStrategy}
      numberOfLines={effectiveNumberOfLines}
      ellipsizeMode={effectiveEllipseMode}
    >
      {stripHtml(text)}
    </Text>
  );
};

const WnaText = memo(
  WnaTextComponent,
  (prevProps, nextProps) =>
    prevProps.text === nextProps.text &&
    prevProps.appColors.isDark === nextProps.appColors.isDark,
);

WnaText.displayName = "WnaText";

export default WnaText;
