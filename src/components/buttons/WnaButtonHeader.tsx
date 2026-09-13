import React, { FC, memo, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TFunction } from "i18next";

import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { appLayoutConstants } from "@constants/layoutConstants";
import { navigationLayoutConstants } from "@constants/navigationLayoutConstants";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import WnaTooltip from "@components/effects/WnaTooltip";

export type WnaButtonHeaderProps = {
  appColors: Colors;
  appStyle: AppStyle;
  iconName: keyof typeof iconMap;
  text?: string;
  color?: string;
  onPress: () => void;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  badgeVisible?: boolean;
};

const WnaButtonHeader: FC<WnaButtonHeaderProps> = ({
  appColors,
  appStyle,
  iconName,
  text = "",
  color,
  onPress,
  badgeVisible = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const size = appLayoutConstants.headerButtonHeight;
  const iconSize = navigationLayoutConstants.headerIconSize;

  const resolvedColor = color || appColors.staticWhite;

  const outlineColor = useMemo(
    () => convertHexToRgba(appColors.staticWhite, 0.5),
    [appColors.staticWhite],
  );
  const interactionColor = isPressed
    ? "rgba(255,255,255,0.14)"
    : isHovered
      ? "rgba(255,255,255,0.08)"
      : "transparent";

  return (
    <View style={styles.wrapper}>
      {text ? (
        <WnaTooltip content={text} position="bottom" visible={isHovered} />
      ) : null}
      {React.createElement(
        "button",
        {
          type: "button",
          "aria-label": text || iconName,
          onClick: onPress,
          onMouseDown: () => setIsPressed(true),
          onMouseUp: () => setIsPressed(false),
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => {
            setIsHovered(false);
            setIsPressed(false);
          },
          style: {
            ...styles.pressable,
            appearance: "none",
            backgroundColor: interactionColor,
            border: "none",
            borderRadius: size / 2,
            boxSizing: "border-box",
            cursor: "pointer",
            height: size,
            outlineColor,
            padding: 0,
            width: size,
          } as React.CSSProperties,
        },
        <View
          style={[
            appStyle.containerCenterCenter,
            styles.inner,
            { width: size, height: size },
          ]}
        >
          <WnaIcon iconName={iconName} size={iconSize} color={resolvedColor} />

          {badgeVisible && (
            <View style={[styles.badge, { backgroundColor: appColors.red3 }]} />
          )}
        </View>,
      )}
    </View>
  );
};

export default memo(WnaButtonHeader);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  pressable: {
    outlineOffset: 2,
  },
  inner: {
    backgroundColor: "transparent",
  },
  badge: {
    height: 8,
    width: 8,
    borderRadius: 4,
    position: "absolute",
    top: 14,
    right: 14,
  },
});
