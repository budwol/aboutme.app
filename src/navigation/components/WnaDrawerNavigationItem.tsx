import React, { useMemo } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
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
  const accent = appColors.staticAccent5;

  const backgroundColorActive = useMemo(() => {
    return appColors.isDark ? appColors.coolgray2 : appColors.coolgray1;
  }, [appColors]);

  const getBackgroundColor = (pressed: boolean) => {
    if (isActive) return backgroundColorActive;
    if (pressed) return appColors.coolgray1;
    return "transparent";
  };

  const iconColor = isActive ? accent : appColors.black;
  const textColor = iconColor;
  const opacity = isSecondary && !isActive ? 0.7 : 1;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          paddingLeft: isSecondary ? 32 : 16,
          backgroundColor: getBackgroundColor(pressed),
        },
      ]}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    borderRadius: 4,
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
