import React, { useMemo, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";

type Props = {
  text: string;
  iconName: keyof typeof iconMap;
  onPress: () => void;
  appStyle: AppStyle;
  appColors: Colors;
  isSecondary?: boolean;
  isActive?: boolean;
};

export default function WnaDrawerNavigationItem({
  text,
  iconName,
  onPress,
  appStyle,
  appColors,
  isSecondary = false,
  isActive = false,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const accent = appColors.staticAccent5;

  const backgroundColorActive = useMemo(() => {
    return appColors.isDark ? appColors.coolgray2 : appColors.coolgray1;
  }, [appColors]);

  const getBackgroundColor = (pressed: boolean, hovered: boolean) => {
    if (isActive) return backgroundColorActive;
    if (pressed || hovered) {
      return appColors.isDark ? appColors.coolgray2 : appColors.coolgray1;
    }
    return "transparent";
  };

  const iconColor = isActive ? accent : appColors.black;
  const textColor = iconColor;
  const opacity = isSecondary && !isActive ? 0.7 : 1;

  const buttonStyle = {
    appearance: "none" as const,
    alignItems: "center" as const,
    border: "none",
    boxSizing: "border-box" as const,
    display: "flex" as const,
    fontFamily: "inherit",
    fontSize: "inherit",
    paddingBottom: 14,
    paddingLeft: isSecondary ? 32 : 16,
    paddingRight: 16,
    paddingTop: 14,
    backgroundColor: getBackgroundColor(isPressed, isHovered),
    borderRadius: 4,
    cursor: "pointer" as const,
    position: "relative" as const,
    textAlign: "left" as const,
    width: "100%",
  };

  return React.createElement(
    "button",
    {
      type: "button",
      onClick: onPress,
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => {
        setIsHovered(false);
        setIsPressed(false);
      },
      "aria-label": text,
      "aria-current": isActive ? "page" : undefined,
      style: buttonStyle as React.CSSProperties,
      testID: `drawer-navigation-item-${text}`,
    },
    <View style={styles.content}>
      {isActive && (
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
      )}

      <WnaIcon
        iconName={iconName}
        size={isActive ? 21 : 20}
        color={iconColor}
        style={{ width: 28, opacity }}
      />

      <Text
        style={[
          appStyle.textNeutralMedium,
          styles.text,
          {
            color: textColor,
            opacity,
            fontWeight: isActive ? "600" : "400",
          },
        ]}
      >
        {text}
      </Text>
    </View>,
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  text: {
    marginLeft: 12,
  },
});
