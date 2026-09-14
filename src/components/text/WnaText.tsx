import { isHtml, stripHtml } from "@/utils/htmlSanitizer";
import WnaHtmlRenderer from "@components/content/WnaHtmlRenderer";
import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { lineClampStyle } from "@utils/lineClampStyle";
import React, { CSSProperties, FC, memo } from "react";

export type WnaTextProps = {
  appColors: Colors;
  appStyle: AppStyle;
  text?: string;
  style?: CSSProperties | CSSProperties[];
  numberOfLines?: number;
  ellipseMode?: "clip" | "head" | "middle" | "tail";
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
  showHtml,
  fontFamily,
  fontSize,
  fontColor,
  maxHeight,
}) => {
  const shouldShowHtml = showHtml ?? isHtml(text);
  const effectiveNumberOfLines = numberOfLines ?? 0;
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
    React.createElement(
      "span",
      {
        style: {
          ...(style ? {} : appStyle.textNeutralSmall),
          ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
          color: effectiveFontColor,
          ...(effectiveNumberOfLines > 0
            ? lineClampStyle(effectiveNumberOfLines)
            : null),
        } as CSSProperties,
      },
      stripHtml(text),
    )
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
