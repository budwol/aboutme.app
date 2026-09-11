import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import { FontFamilies } from "@constants/theme/fontFamilies";
import { LinearGradient } from "expo-linear-gradient";
import { sanitizeHtml } from "@utils/htmlSanitizer";
import { CSSProperties, FC, memo } from "react";

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

const fallbackHtml = '<!DOCTYPE html><html lang="de"><body></body></html>';

const WnaHtmlRendererComponent: FC<WnaHtmlRendererProps> = ({
  appColors,
  appStyle: _appStyle,
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
  const effectiveHtml = sanitizeHtml(html === "" ? fallbackHtml : html);
  const webStyles: CSSProperties = {
    padding: effectivePadding,
    fontFamily: effectiveFontFamily,
    fontSize: effectiveFontSize,
    lineHeight: 1.5,
    backgroundColor: "transparent",
    color: effectiveFontColor,
  };

  return (
    <>
      <div
        style={webStyles}
        dangerouslySetInnerHTML={{ __html: effectiveHtml }}
      />
      {maxHeight ? (
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
            height: maxHeight / 2,
          }}
        />
      ) : null}
    </>
  );
};

export function areWnaHtmlRendererPropsEqual(
  prevProps: WnaHtmlRendererProps,
  nextProps: WnaHtmlRendererProps,
) {
  return (
    prevProps.html === nextProps.html &&
    prevProps.appColors.isDark === nextProps.appColors.isDark
  );
}

const WnaHtmlRenderer = memo(
  WnaHtmlRendererComponent,
  areWnaHtmlRendererPropsEqual,
);

WnaHtmlRenderer.displayName = "WnaHtmlRenderer";

export default WnaHtmlRenderer;
