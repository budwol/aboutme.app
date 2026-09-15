import React, { CSSProperties, memo } from "react";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import WnaIcon from "../icon/WnaIcon/WnaIcon";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";

type BadgeStyle = CSSProperties & {
  paddingHorizontal?: number;
  paddingVertical?: number;
};

export type WnaBadgeProps = {
  appColors: Colors;
  appStyle: AppStyle;
  style?: BadgeStyle | BadgeStyle[];
  textStyle?: BadgeStyle | BadgeStyle[];
  fontColor?: string;
  icon?: keyof typeof iconMap;
  text?: string;
};

const WnaBadge = ({
  appColors,
  appStyle,
  style,
  textStyle,
  fontColor,
  icon,
  text,
}: WnaBadgeProps) => {
  if (!icon && !text) return null;

  const containerStyle = flattenStyles([
    styles.container,
    { backgroundColor: appColors.warmgray6 },
    style,
  ]);
  const labelStyle = flattenStyles([
    appStyle.textMicro as CSSProperties,
    styles.text,
    { color: fontColor ?? appColors.white },
    textStyle,
  ]);

  return (
    <div aria-label={text} style={containerStyle}>
      {icon && (
        <WnaIcon iconName={icon} size={13} color={appColors.coolgray8} />
      )}

      {text && <span style={labelStyle}>{text}</span>}
    </div>
  );
};

function flattenStyles(
  styles: (BadgeStyle | BadgeStyle[] | undefined)[],
): CSSProperties {
  return styles.reduce<CSSProperties>((result, style) => {
    if (Array.isArray(style)) return { ...result, ...flattenStyles(style) };
    const { paddingHorizontal, paddingVertical, ...cssStyle } = style ?? {};
    return {
      ...result,
      ...cssStyle,
      ...(paddingHorizontal !== undefined && {
        paddingLeft: paddingHorizontal,
        paddingRight: paddingHorizontal,
      }),
      ...(paddingVertical !== undefined && {
        paddingTop: paddingVertical,
        paddingBottom: paddingVertical,
      }),
    };
  }, {});
}

const styles: { container: CSSProperties; text: CSSProperties } = {
  container: {
    display: "flex",
    alignSelf: "flex-start",
    flexGrow: 0,
    flexShrink: 0,
    boxSizing: "border-box",
    height: 20,
    paddingInline: 4,
    paddingBlock: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  text: {
    textAlign: "center",
  },
};

export default memo(WnaBadge);
