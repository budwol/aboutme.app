import WnaSurfaceCard from "@components/cards/WnaSurfaceCard";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { convertHexToRgba } from "@utils/colorConverter";
import { lineClampStyle } from "@utils/lineClampStyle";
import { TFunction } from "i18next";
import React, { CSSProperties, FC, memo, useMemo, useState } from "react";

export type WnaNavigationItemProps = {
  appColors: Colors;
  appStyle: AppStyle;
  text: string;
  iconName: keyof typeof iconMap;
  onPress: (text: string) => void;
  iconRightName?: keyof typeof iconMap | null;
  t: TFunction<string[], undefined>;
  style?: CSSProperties;
  type?: "first" | "last" | "middle" | "standalone" | undefined;
};

const WnaNavigationItemComponent: FC<WnaNavigationItemProps> = ({
  appColors,
  appStyle,
  text,
  iconName,
  onPress,
  iconRightName,
  type,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const effectiveIconRightName =
    iconRightName === undefined ? "chevron-right" : iconRightName;
  const effectiveType = type ?? "standalone";
  const borderStyle = useMemo(
    () =>
      ({
        borderTopLeftRadius:
          effectiveType === "first" || effectiveType === "standalone"
            ? appLayoutConstants.globalCornerRadius
            : 0,
        borderTopRightRadius:
          effectiveType === "first" || effectiveType === "standalone"
            ? appLayoutConstants.globalCornerRadius
            : 0,
        borderBottomLeftRadius:
          effectiveType === "last" || effectiveType === "standalone"
            ? appLayoutConstants.globalCornerRadius
            : 0,
        borderBottomRightRadius:
          effectiveType === "last" || effectiveType === "standalone"
            ? appLayoutConstants.globalCornerRadius
            : 0,
      }) as CSSProperties,
    [effectiveType],
  );

  const textColorStyle = useMemo(
    () => ({
      color: convertHexToRgba(appColors.black, 0.7),
    }),
    [appColors.black],
  );

  const leftIconColor = appColors.accent5;
  const rightIconColor = appColors.coolgray4;
  const interactionColor = appColors.isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";
  const buttonStyle = {
    ...borderStyle,
    appearance: "none" as const,
    backgroundColor: isPressed || isHovered ? interactionColor : "transparent",
    border: "none",
    boxSizing: "border-box" as const,
    cursor: "pointer" as const,
    display: "block" as const,
    padding: 0,
    textAlign: "left" as const,
    width: "100%",
  };

  return React.createElement(
    "button",
    {
      type: "button",
      "aria-label": text,
      onClick: () => onPress(text),
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => {
        setIsHovered(false);
        setIsPressed(false);
      },
      style: buttonStyle as React.CSSProperties,
    },
    <WnaSurfaceCard appColors={appColors} type={type}>
      {React.createElement(
        "div",
        { style: styles.row },
        React.createElement(
          "div",
          { style: styles.iconWrapper },
          <WnaIcon iconName={iconName} size={24} color={leftIconColor} />,
        ),
        React.createElement(
          "div",
          { style: styles.content },
          React.createElement(
            "span",
            {
              style: {
                ...appStyle.textNeutralMedium,
                ...styles.text,
                ...textColorStyle,
                ...lineClampStyle(1),
              } as CSSProperties,
            },
            text,
          ),
        ),
        effectiveIconRightName
          ? React.createElement(
              "div",
              { style: styles.trailingIcon },
              <WnaIcon
                iconName={effectiveIconRightName}
                size={24}
                color={rightIconColor}
              />,
            )
          : null,
      )}
    </WnaSurfaceCard>,
  );
};

const WnaNavigationItem = memo(WnaNavigationItemComponent);

WnaNavigationItem.displayName = "WnaNavigationItem";

export default WnaNavigationItem;

const styles: Record<string, CSSProperties> = {
  row: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    alignContent: "center",
    position: "relative",
  },
  iconWrapper: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  text: {
    // `width: "100%"` has no effect here — this style applies to a plain
    // inline `<span>`, and `width` does not apply to non-replaced inline
    // elements per the CSS spec. Only `paddingRight` actually renders.
    paddingRight: 24,
    alignSelf: "center",
  },
  trailingIcon: {
    position: "absolute",
    right: 0,
    marginRight: 8,
    alignSelf: "center",
  },
};
